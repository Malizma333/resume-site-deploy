import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    try {
        const client = await clientPromise;

        const resumeCollection = client.db("resumes").collection("resumes");
        const resumeDoc = await resumeCollection.findOne({ email });

        if (!resumeDoc) {
            return NextResponse.json({ error: "Resume not found" }, { status: 404 });
        }

        return new Response(Buffer.from(resumeDoc.data.buffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${email}-resume.pdf"`,
            },
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
