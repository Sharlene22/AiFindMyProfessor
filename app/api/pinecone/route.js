import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";

export async function POST(req) {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pc.index("ratepf").namespace("ns3");

  const results = await index.listPaginated();
  const listIds = results["vectors"] || [];

  if (listIds.length === 0) {
    // No IDs found, return empty response or handle accordingly
    return new NextResponse(
      JSON.stringify({ subjects: [], schools: [] }),
      { status: 200 }
    );
  }

  const IDs = listIds.map((item) => item.id);

  // Now fetch only if we have IDs
  const fetchResult = await index.fetch(IDs);
  const records = fetchResult["records"] || {};

  const metadata = Object.values(records).map((record) => record.metadata);

  const allSubjects = metadata.flatMap((record) => record.subject || []);
  const uniqueSubjects = [...new Set(allSubjects)];

  const allSchools = metadata.flatMap((record) => record.school || []);
  const uniqueSchools = [...new Set(allSchools)];

  const response = {
    subjects: uniqueSubjects,
    schools: uniqueSchools,
  };

  return new NextResponse(JSON.stringify(response));
}
