import { MongoClient, ServerApiVersion } from "mongodb";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

const uri = process.env.MONGO_URI;

async function getApplications() {
    if (!uri) {
        throw new Error("MONGO_URI is not defined");
    }
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
    });
    await client.connect();
    // Replace 'yourDbName' with your actual database name.
    const apps = await client.db("main").collection("applications").find({}).toArray();
    await client.close();
    return apps;
}

export default async function ApplicationsPage() {
    const applications = await getApplications();

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-200">
                <Table className="min-w-full divide-y divide-gray-300">
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase">Name</TableHead>
                            <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase">Email</TableHead>
                            <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase">University</TableHead>
                            <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase">Grad Year</TableHead>
                            <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase">Resume</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white divide-y divide-gray-200">
                        {applications.map((app: any) => (
                            <TableRow key={app._id} className="hover:bg-gray-50">
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{app.first_name + " " + app.last_name}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{app.email}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{app.education[0].school_name}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{app.education[0].end_date ? new Date(app.education[0].end_date * 1000).toLocaleString() : "-"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
