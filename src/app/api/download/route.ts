import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { GridFSBucket } from "mongodb";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db("resumes");

        // 1. Find application document
        const applications = db.collection("resumes");
        const application = await applications.findOne({ email });

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        // 2. Get resumeFileId from application
        const resumeFileId = application.resumeFileId;
        if (!resumeFileId) {
            return NextResponse.json({ error: "Resume not found" }, { status: 404 });
        }

        // 3. Verify file exists in GridFS
        const filesCollection = db.collection("fs.files");
        const fileExists = await filesCollection.findOne({ _id: resumeFileId });
        if (!fileExists) {
            return NextResponse.json({ error: "Resume not found" }, { status: 404 });
        }

        // 4. Create GridFS bucket and stream
        const bucket = new GridFSBucket(db);
        const downloadStream = bucket.openDownloadStream(resumeFileId);

        // 5. Collect chunks into buffer
        const buffer = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            downloadStream.on("data", (chunk) => chunks.push(chunk));
            downloadStream.on("error", reject);
            downloadStream.on("end", () => resolve(Buffer.concat(chunks)));
        });

        return new Response(buffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${email}-resume.pdf"`,
            },
        });
    } catch (error) {
        console.error("Download error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Download failed" }, { status: 500 });
    }
}
