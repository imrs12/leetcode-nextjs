import axios from "axios"

export async function getJudge0LanguageId(langauge){
    const languageMap = {
        "PYTHON": 71,
        "JAVASCRIPT": 63,
        "JAVA": 62,
        "GO": 54,
        "CPP": 60
    }

    return languageMap[langauge.toUpperCase()]
}

export async function submitBatch(submissions){
    const {data} = await axios.post(
        `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
        {submissions}
    )
    console.log("Batch submission response:", data)

    return data;
}

export async function pollBatchResults(tokens){
    while(true){
        const {data} = await axios.get(
            `${process.env.JUDGE0_API_URL}/submissions/batch`,
            {
                params: {
                    tokens: tokens.join(","),
                    base64_encoded: false
                }
            }
        )
         console.log(data);
        const results = data.submissions;

        const isAllDone = results.every(
            (r) => r.status.id !== 1 && r.status.id !== 2
        )

        if(isAllDone) return results
        await sleep(1000)
    }
  
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))