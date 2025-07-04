const fs = require('fs');
const path = require('path');

module.exports = async function (context, req) {
    const department_id = req.params.department_id;
    context.log(`GetTemplate function processed a request for department_id: ${department_id}`);

    // モックデータやテンプレートファイルのパスを解決
    const templatePath = path.resolve(__dirname, `../src/templates/template_${department_id}.json`);

    try {
        // テンプレートファイルを読み込む
        const templateData = fs.readFileSync(templatePath, 'utf8');
        const templateJson = JSON.parse(templateData);

        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: templateJson
        };
    } catch (error) {
        // ファイルが存在しない、またはJSONとしてパースできない場合
        context.log.error(error);
        context.res = {
            status: 404,
            body: "Template not found or invalid format."
        };
    }
};