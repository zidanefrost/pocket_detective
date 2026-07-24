export default {
  async fetch(): Promise<Response> {
    try {
      const roomQuest = await import("../src/server/roomQuest");
      return Response.json({
        ok: true,
        maxApiImageBytes: roomQuest.MAX_API_IMAGE_BYTES,
      });
    } catch (error) {
      return Response.json(
        {
          ok: false,
          errorName: error instanceof Error ? error.name : "UnknownError",
          errorMessage:
            error instanceof Error ? error.message : "Module import failed.",
        },
        { status: 500 },
      );
    }
  },
};
