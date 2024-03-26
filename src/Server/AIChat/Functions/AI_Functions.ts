import { AI_Model } from "../../../Middleware/GenAI";
import checkUndefined from "../../../Public Functions/checkUndefined";
import responseGenerator from "../../../Public Functions/responseGenerator";
import { Database } from "../../../data-source";


const AIChat = AI_Model.startChat({
            
    history: [
    ],
});

class AI_Functions{

    async getPromptResponse(reqData){
        

        // Check Parameter Existence
        const checkParams = checkUndefined(reqData,['prompt'])
        if (checkParams){
            return responseGenerator.sendMissingParam(checkParams)
        }
        try{
            const prompt = `If the Next Propt it Related to The Medical Field, Mental Health, Some Personal Talking with no Personl Info, or Somthing that Might Be Said in the Context of Medical Group  and Safe, Response to It, other With,
            Respond With 'i am a Model Working With Medical Questions and This Question is Not Related' or Something Like That, But Don't Be Relly Strict, and Be Friendly, The Prompt:(${reqData['prompt']})`
            const AI_Response = await AIChat.sendMessage(prompt)

            return responseGenerator.sendData(AI_Response.response.text())
        }catch(err){
            console.log("Error!\n",err)
            return responseGenerator.Error
        }
    }
    
}

export default new AI_Functions();
