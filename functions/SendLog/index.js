module.exports = async function (context, req) {
    context.log('SendLog function processed a request.');

    const logData = req.body;

    // ここでログを記録する処理を実装します（例：データベース、ストレージなど）
    // 今回はモックとして受け取ったデータをそのままログに出力します
    context.log("Received log data:", logData);

    context.res = {
        status: 200,
        body: "Log received successfully."
    };
};