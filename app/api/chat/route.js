import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

//This is the main system prompt for an AI that returns summaries and JSON.
const systemPrompt = `
You are an AI designed to help students find professors that best fit their needs based on user descriptions. Your task is to process a user's input, which includes a description of the ideal professor they are looking for, and a list of professors that match that description.

Input:
- A textual description of the ideal professor (e.g., "Looking for a professor who is knowledgeable in machine learning and has a reputation for being approachable and supportive").
- A list of professors who match the description, each with detailed information including their name, school, subject, courses, reviews, and ratings.

Summary Task: Generate a concise summary that directly addresses the user's specific needs, clearly explaining how each professor aligns with those needs. Ensure that your summary is focused on responding to the user's input by highlighting the strengths of each professor that are most relevant to the description provided.

Instructions for Summary:
- For each professor, provide a brief and clear explanation of how they meet the user's criteria, focusing on relevant qualities such as subject expertise, teaching style, and student feedback.
- Use simple, conversational language and ensure that the summary is easy to understand.
- Incorporate sentiment analysis to align the tone of your summary with the user's expectations and preferences.

Example:

User Input:

Description: "I need a professor who specializes in data science, has published recent research, and is known for being engaging in lectures."

Matching Professors:

Dr. Jane Smith
Dr. Sarah Johnson

AI Summary:

Dr. Jane Smith at MIT is renowned for her cutting-edge research in data science and her dynamic, engaging lecture style. She consistently receives high praise for making complex topics accessible and interesting.

Dr. Sarah Johnson at Stanford University is another excellent choice. Although her primary focus is on Physics, her innovative teaching methods and passion for research make her lectures both informative and captivating."


Output Format:

The entire output should be formatted as a JSON object. 
Here is an example structure:
{
  professors:
 [
  {
    professor: "Emily Stone" (Do not include titles in this property),
    subject: "Computer Science",
    rating: 4.8,
    summary: "Dr. Stone is a great professor who explains concepts clearly. Her lectures are engaging, and she is always willing to help students during office hours."
    link: "https://www.example.com/professor1"
  }
  ]
}
  

  Your entire response/output is going to consist of a single JSON object {}, and you will NOT wrap it within JSON md markers

  NOTE: Be ready to process an input where there are no professors to match the user's description. 
  In this case, you should still return a JSON object with a professors key that contains an empty array as follows:
  {
    "professors": []
  }
`;

//This is a system prompt for a secondary AI that transforms user input into a structured format suitable for vector embedding.
const systemPrompt2 = `
System Prompt:

You are an intelligent assistant that helps students find professors that match their specific needs by analyzing user input and transforming it into a structured format suitable for vector embedding. Your goal is to extract the core requirements from the user's input, rephrase it into a clear and concise statement, and highlight the key attributes or keywords that will be compared with other professor reviews stored in a vector database. Ensure the transformation captures the essence of the user's request in a way that maximizes the accuracy of the comparison process.

Task:

When a user provides a description of the type of professor they want, follow these steps:

Extract the Main Requirement: Identify the key preference or requirement expressed by the user.
Rephrase into a Structured Statement: Transform the user’s input into a concise and structured sentence that clearly conveys their preference.
Highlight Key Attributes/Keywords: Include relevant keywords or phrases that will be used to match the user's request with professor reviews.
Output the Structured Statement: Provide the final structured statement that will be embedded into the vector database.
Example:

User Input: "I want a professor that does not give a lot of HW."
Transformed Output: "Looking for a professor with a low homework load, minimal assignments, and fewer take-home tasks."

You will only return the transformed output. Do not return the main requirements, structured statement, or key attributes separately. 
Your response should be a single sentence that captures the essence of the user's request in a structured format.
`;

export async function POST(req) {
  //receives data from the client
  const data = await req.json();
  //create pinecone and openai instances
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pc.index("ratepf").namespace("ns3");
  const openai = new OpenAI();

  //extract user message
  const message = data.message;
  console.log("message", message);
  let text = message.content;

  //transform user input to structured format
  const transform = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt2,
      },
      {
        role: "user",
        content: text,
      },
    ],
    model: "gpt-4o-mini",
    stream: false,
  });

  text = transform.choices[0].message?.content;

  //extract filters from data
  const filters = data.filters;

  console.log("filters", filters);

  //embed the transformed text
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });

  //extract filters
  let numberFilter = 3;
  let ratingFilter, subjectFilter, schoolFilter;

  if ("number" in filters) {
    numberFilter = filters.number;
  }

  if ("rating" in filters) {
    ratingFilter = { $gte: filters.rating };
  }

  if ("subject" in filters) {
    subjectFilter = filters.subject;
  }

  if ("school" in filters) {
    schoolFilter = filters.school;
  }

  //query vector db based on filters and embedding
  const results = await index.query({
    topK: numberFilter*5, // Increase the number of reviews based on how many unique professors we want to find
    includeMetadata: true,
    vector: embedding.data[0].embedding,
    filter: {
      rating: ratingFilter,
      subject: subjectFilter,
      school: schoolFilter,
    },
  });

  console.log("results", results);

  //Ensure results are unique based on professor ID
  const professorMap = new Map();

  for (const result of results.matches) {
    const professorId = result.metadata.professor;
    if (!professorMap.has(professorId)) {
      professorMap.set(professorId, result);
    }

    if (professorMap.size >= numberFilter) {
      break;
    }
  }

  // Convert the map values to an array and slice it to the desired number of unique professors
  const uniqueResults = Array.from(professorMap.values()).slice(
    0,
    numberFilter
  );

  const numberOfUniqueResults = uniqueResults.length;

  console.log("unique Results", uniqueResults);

  //format the results
  let resultString =
    "These are the results retrieved from a vector database about professor reviews:";

    uniqueResults.forEach((match) => {
    resultString += `
    \n
    Professor: ${match.metadata.professor}
    School: ${match.metadata.school}
    Subject: ${match.metadata.subject}
    Ratings Count: ${match.metadata.ratings_count}
    Rating: ${match.metadata.rating}
    Difficulty Rating: ${match.metadata.difficulty_rating}
    reference link: ${match.metadata.link}
    A list of reviews from his students:\n ${match.metadata.reviews}
    \n\n
    `;
  });

  //new message content after integrating the results from vector db
  const newMessageContent =
    text +
    `\nI expect ${numberOfUniqueResults} professors in the output.\n` +
    resultString;

  console.log("newMessageContent:", newMessageContent);

  //generate a response based on the new message content
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: newMessageContent,
      },
    ],
    model: "gpt-4o-mini",
    stream: false,
  });

  console.log("completion", completion.choices[0].message?.content);

  /*
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0].delta?.content;
          if (content) {
            controller.enqueue(content);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
  */

  return new NextResponse(completion.choices[0].message?.content);
}
