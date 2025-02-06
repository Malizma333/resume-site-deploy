import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET() {
    try {
        const client = await clientPromise;
        const apps = await client.db("main").collection("applications").find({}).toArray();

        const applications = JSON.parse(JSON.stringify(apps));

        return NextResponse.json(applications);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
