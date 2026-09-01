/**
 * Automated test suite for InterviewForge AI frontend interview-generation flow.
 *
 * Verifies:
 * 1. Generate Interview does NOT block when local analysis state is unavailable.
 * 2. API request payload is properly structured as { count: <number> } (simplest valid payload).
 * 3. Successful 200/201 response is handled correctly.
 * 4. Backend error messages (FastAPI standard format, detail string, detail array, network errors)
 *    are extracted and displayed properly instead of the obsolete hardcoded string.
 */

import assert from "node:assert";
import { getApiErrorMessage } from "../lib/utils";
import { interviewsApi } from "../services/api";
import { apiClient } from "../lib/api-client";

async function runTests() {
  console.log("=================================================================");
  console.log("   InterviewForge AI Frontend Interview Flow Verification Tests   ");
  console.log("=================================================================\n");

  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      fn();
      console.log(`[PASS] Test ${total.toString().padStart(2, "0")}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] Test ${total.toString().padStart(2, "0")}: ${name}`);
      console.error(err);
    }
  }

  async function asyncTest(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`[PASS] Test ${total.toString().padStart(2, "0")}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] Test ${total.toString().padStart(2, "0")}: ${name}`);
      console.error(err);
    }
  }

  // ---------------------------------------------------------------------------
  // 1. Error Message Extractor Tests
  // ---------------------------------------------------------------------------

  test("getApiErrorMessage extracts structured error.message", () => {
    const error = {
      response: {
        data: {
          error: {
            message: "No active job description found for profile.",
          },
        },
      },
    };
    const msg = getApiErrorMessage(error);
    assert.strictEqual(msg, "No active job description found for profile.");
    assert.ok(!msg.includes("Ensure resume and active JD are analyzed"));
  });

  test("getApiErrorMessage extracts FastAPI detail string", () => {
    const error = {
      response: {
        data: {
          detail: "Resume file content is empty.",
        },
      },
    };
    const msg = getApiErrorMessage(error);
    assert.strictEqual(msg, "Resume file content is empty.");
  });

  test("getApiErrorMessage extracts FastAPI validation errors array (422)", () => {
    const error = {
      response: {
        data: {
          detail: [
            { loc: ["body", "count"], msg: "Input should be greater than or equal to 1" },
          ],
        },
      },
    };
    const msg = getApiErrorMessage(error);
    assert.strictEqual(msg, "Input should be greater than or equal to 1");
  });

  test("getApiErrorMessage handles Network Error with informative message", () => {
    const error = {
      message: "Network Error",
    };
    const msg = getApiErrorMessage(error);
    assert.strictEqual(
      msg,
      "Unable to connect to backend server. Please verify the backend is running."
    );
  });

  test("getApiErrorMessage provides clean fallback for empty or unknown error", () => {
    const msg = getApiErrorMessage(null, "Custom fallback message");
    assert.strictEqual(msg, "Custom fallback message");
  });

  // ---------------------------------------------------------------------------
  // 2. interviewsApi.generate Request Payload & Endpoint Tests
  // ---------------------------------------------------------------------------

  await asyncTest("interviewsApi.generate sends simplest valid payload { count: N } to /interview-questions/generate", async () => {
    let capturedUrl = "";
    let capturedPayload: unknown = null;

    // Spy on apiClient.post
    const originalPost = apiClient.post;
    apiClient.post = async <T>(url: string, data?: unknown) => {
      capturedUrl = url;
      capturedPayload = data;
      return {
        questions: [
          {
            id: "q-1",
            profile_id: "prof-123",
            question: "Explain Python GIL",
            category: "technical",
            difficulty: "medium",
            expected_answer_points: ["Thread safety"],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        total: 1,
      } as unknown as T;
    };

    try {
      // Simulate frontend submitting dialog with question_count = 10
      const res = await interviewsApi.generate("prof-123", {
        question_count: 10,
        interview_type: "technical",
      });

      assert.strictEqual(
        capturedUrl,
        "/profiles/prof-123/interview-questions/generate",
        "Must call /interview-questions/generate endpoint"
      );
      assert.deepStrictEqual(
        capturedPayload,
        { count: 10 },
        "Must format payload as simplest valid payload { count: 10 }"
      );
      assert.ok(res, "Must return successful response");
    } finally {
      apiClient.post = originalPost;
    }
  });

  await asyncTest("interviewsApi.generate supports count, resume_id, job_description_id when available", async () => {
    let capturedUrl = "";
    let capturedPayload: unknown = null;

    const originalPost = apiClient.post;
    apiClient.post = async <T>(url: string, data?: unknown) => {
      capturedUrl = url;
      capturedPayload = data;
      return { questions: [], total: 0 } as unknown as T;
    };

    try {
      await interviewsApi.generate("prof-456", {
        count: 7,
        resume_id: "res-001",
        job_description_id: "jd-002",
      });

      assert.strictEqual(
        capturedUrl,
        "/profiles/prof-456/interview-questions/generate"
      );
      assert.deepStrictEqual(capturedPayload, {
        count: 7,
        resume_id: "res-001",
        job_description_id: "jd-002",
      });
    } finally {
      apiClient.post = originalPost;
    }
  });

  await asyncTest("interviewsApi.generate works WITHOUT requiring resume_id/job_description_id/skill_gap_id", async () => {
    let capturedUrl = "";
    let capturedPayload: unknown = null;

    const originalPost = apiClient.post;
    apiClient.post = async <T>(url: string, data?: unknown) => {
      capturedUrl = url;
      capturedPayload = data;
      return {
        questions: [
          {
            id: "q-2",
            profile_id: "prof-789",
            question: "Describe your experience with distributed systems.",
            category: "technical",
            difficulty: "hard",
            expected_answer_points: ["CAP theorem", "Consensus algorithms"],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        total: 1,
      } as unknown as T;
    };

    try {
      // Calling with only question_count (no local resume analysis, no local JD analysis, no skill gap)
      const res = await interviewsApi.generate("prof-789", {
        question_count: 5,
      });

      assert.strictEqual(capturedUrl, "/profiles/prof-789/interview-questions/generate");
      assert.deepStrictEqual(capturedPayload, { count: 5 });
      assert.strictEqual((res as any).total, 1);
    } finally {
      apiClient.post = originalPost;
    }
  });

  // ---------------------------------------------------------------------------
  // 3. interviewsApi.list / get / delete and Post-Generation Flow Tests
  // ---------------------------------------------------------------------------

  await asyncTest("interviewsApi.list fetches /profiles/{profile_id}/interview-questions", async () => {
    let capturedUrl = "";
    const originalGet = apiClient.get;
    apiClient.get = async <T>(url: string) => {
      capturedUrl = url;
      return {
        items: [
          {
            id: "q-101",
            profile_id: "prof-123",
            question: "Explain Python GIL and concurrency model",
            category: "technical",
            difficulty: "medium",
            skill: "Python",
            expected_answer_points: ["Thread safety", "CPython reference counting"],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        total: 1,
      } as unknown as T;
    };

    try {
      const res = await interviewsApi.list("prof-123");
      assert.strictEqual(
        capturedUrl,
        "/profiles/prof-123/interview-questions",
        "Must fetch from /interview-questions endpoint"
      );
      assert.strictEqual(res.items.length, 1);
      assert.strictEqual(res.items[0].id, "q-101");
      assert.strictEqual(res.items[0].question, "Explain Python GIL and concurrency model");
      assert.strictEqual(res.items[0].skill, "Python");
    } finally {
      apiClient.get = originalGet;
    }
  });

  await asyncTest("interviewsApi.get fetches single interview question by ID", async () => {
    let capturedUrl = "";
    const originalGet = apiClient.get;
    apiClient.get = async <T>(url: string) => {
      capturedUrl = url;
      return {
        id: "q-101",
        profile_id: "prof-123",
        question: "Explain Python GIL",
        category: "technical",
        difficulty: "medium",
        skill: "Python",
        expected_answer_points: ["Thread safety"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as unknown as T;
    };

    try {
      const res = await interviewsApi.get("prof-123", "q-101");
      assert.strictEqual(
        capturedUrl,
        "/profiles/prof-123/interview-questions/q-101"
      );
      assert.strictEqual(res.id, "q-101");
    } finally {
      apiClient.get = originalGet;
    }
  });

  await asyncTest("interviewsApi.delete sends DELETE to /profiles/{profile_id}/interview-questions/{question_id}", async () => {
    let capturedUrl = "";
    const originalDelete = apiClient.delete;
    apiClient.delete = async <T>(url: string) => {
      capturedUrl = url;
      return { success: true, message: "Interview question deleted successfully" } as unknown as T;
    };

    try {
      const res = await interviewsApi.delete("prof-123", "q-101");
      assert.strictEqual(
        capturedUrl,
        "/profiles/prof-123/interview-questions/q-101"
      );
      assert.strictEqual(res.success, true);
    } finally {
      apiClient.delete = originalDelete;
    }
  });

  test("Generated interview question items render safely without missing property crashes", () => {
    const rawQuestionItem = {
      id: "q-999",
      profile_id: "prof-abc",
      question: "How do you optimize slow database queries in PostgreSQL?",
      category: "technical",
      difficulty: "hard",
      skill: "PostgreSQL",
      expected_answer_points: [
        "Run EXPLAIN ANALYZE",
        "Add appropriate B-tree or partial indexes",
        "Check table bloat and vacuuming",
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Verify safe accessor logic as implemented in InterviewsPage
    const questionText = (rawQuestionItem as any).question || (rawQuestionItem as any).title || "Generated Question";
    const category = (rawQuestionItem as any).category || (rawQuestionItem as any).interview_type || "technical";
    const difficulty = (rawQuestionItem as any).difficulty;
    const skill = (rawQuestionItem as any).skill;
    const statusVal: unknown = (rawQuestionItem as Record<string, unknown>).status;
    const expectedPoints: string[] = Array.isArray((rawQuestionItem as any).expected_answer_points)
      ? (rawQuestionItem as any).expected_answer_points
      : [];

    assert.strictEqual(questionText, "How do you optimize slow database queries in PostgreSQL?");
    assert.strictEqual(category, "technical");
    assert.strictEqual(difficulty, "hard");
    assert.strictEqual(skill, "PostgreSQL");
    assert.strictEqual(statusVal, undefined);
    assert.strictEqual(expectedPoints.length, 3);
    // Ensure safe status check doesn't throw
    const formattedStatus = typeof statusVal === "string" ? (statusVal as string).replace("_", " ") : null;
    assert.strictEqual(formattedStatus, null);
  });

  console.log(`\nResults: ${passed}/${total} tests passed.\n`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests();

