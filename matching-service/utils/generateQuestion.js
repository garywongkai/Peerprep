const baseUrl =  process.env.REACT_APP_ENV === "development" ? "http://service:5000/question/randomQuestion" : "https://service-327190433280.asia-southeast1.run.app/question/randomQuestion"; // must use "service:" rather than "localhost:" in internal cross-service cnnection

exports.generateQuestion = async (difficulty, category) => {
    try {
        let url = `${baseUrl}`;
        const params = new URLSearchParams();

        if (category) {
            params.append("category", category);
        }
        if (difficulty) {
            params.append("difficulty", difficulty);
        }
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        const response = await fetch(url, {
            method: "GET",
        });
        if (!response.ok) {
            throw new Error(
                `Failed to fetch question. Status: ${response.status}`
            );
        }
        const responseData = await response.json();
        console.log("Question Meta Data:")
        console.log(responseData);
        return responseData;
    } catch (error) {
        console.error("Error to generate question:", error);
        return null;
    }
};
