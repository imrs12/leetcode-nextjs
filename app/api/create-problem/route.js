import { prisma } from "@/lib/db";
import { getJudge0LanguageId, pollBatchResults, submitBatch } from "@/lib/judge0";
import { getCurrentUser, getUserRole } from "@/modules/auth/actions";
import { NextResponse } from "next/server";
import { success } from "zod";

export async function POST(request){
    try {
        const userRole = await getUserRole()

        const user = await getCurrentUser()

        if(userRole !== userRole.ADMIN) {
            return NextResponse.json({
                error: "Unauthorized"
            }, {
                status: 401
            })
        }

        const body = await request.json();

        const {
           title,
           description,
           difficulty,
           tags,
           examples,
           constraints,
           testCases,
           codeSnippets,
           referenceSolutions
        } = body
         
        if(!title || !description || !difficulty || !codeSnippets || !referenceSolutions){
            return NextResponse.json(
                { error: "Missing require fields" },
                { status: 400 }
            )
        }

        // validate test cases
        if(!Array.isArray(testCases) || testCases.length === 0){
            return NextResponse.json(
                { error: "At least one test case is required" }, 
                { status: 400 }
            )
        }

        //validating references solutions
        if(!referenceSolutions || typeof referenceSolutions !== 'object') {
            return NextResponse.json(
                { return: "Reference solutions must be provided for all supported languages"},
                { status: 400 }
            )
        }

        for( const [language, solutionCode] of Object.entries(referenceSolutions)){
            //getting Judge0 Language ID for the current language

            const languageId = getJudge0LanguageId()

            if(!languageId){
                return NextResponse.json(
                    {error: `Unsupported Language: ${language}`},
                    { status: 400}

                )
            }

            //prepare Judge Submissions for all testcases 
            const submissions = testCases.map((input, output) => ({
                source_code:solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output
            }))

            //Submit all testcases in one batch
            const submissionResults = await submitBatch(submission)

            const tokens = submissionResults.map((res)=> res.tokens )

            const results = await pollBatchResults(tokens)

            for( let i = 0; i< results.length; i++){
                const result = results[i]

                if(result.status.id !== 3){
                    return NextResponse.json(
                        {
                            error: `Validation failed for ${language}`,
                            testCase: {
                                input: submissions[i].stdin,
                                expected_output: submissions[i].expected_output,
                                actualOutput: result.stdout,
                                error: result.stderr || result.compile_output
                            },
                            details: result
                        },
                        {status: 400}
                    )
                }
            }
        }

        const newProblem = await prisma.problem.create({
                data: {
                    title,
                    description,
                    difficulty,
                    tags,
                    examples,
                    constraints,
                    testCases,
                    codeSnippets,
                    referenceSolutions,
                    userId: user.id
                }
            })

            return NextResponse.json({
                success: true,
                message: "Problem created successfully",
                data: newProblem,
            }, { status: 201 })
    
    } catch (error) {
        console.error("Database error:", error)

        return NextResponse.json({
            error: "Failed to sacve the problem to database"
        }, {
            status: 500
        })
    }
}