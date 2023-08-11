const whatsappModel = require("../shared/whatsappmodels");
const whatsappService = require("../services/whatsappService");
const chatGPTService =  require("../services/chatpgt-service")

async function Process(textUser, number){
    textUser = typeof textUser == 'string' ? textUser.toLowerCase() : textUser;
    let models = [];
    const cart = [];
    const pizzaPromo = {
        number: 0
    };


    if(typeof textUser === 'object') {
        const data = await textUser;
        const tiempo = await data.duration.text.replace('hour','hora');
        const rangeLimit = 60000;

        const limiteEntrega = await data.distance.value > rangeLimit ? 
        '*Estás fuera de nuestro rango de entrega* ☹, lo sentimos mucho pero no podemos tomar tu pedido' : 
        '*Estás dentro de nuestro rango de entrega* 😊';

        let model = whatsappModel.MessageText(
            "Distancia del negocio a tu dirección es de "+ await data.distance.text +"\n"+
            "Y tardaríamos en llegar "+ tiempo +" aproximadamente.\n"+
            limiteEntrega
            , number);
            models.push(model);

        if(await data.distance.value < rangeLimit){             
            const model = whatsappModel.MessageLocationConfirmation(number);
        
            models.push(model);
        }

    }
    else {
        const resultChatGPT = await chatGPTService.GetMessageChatGPT(textUser);

        if(resultChatGPT != null) {
            let model = whatsappModel.MessageText(resultChatGPT, number);
            models.push(model);
        } else {
            let model = whatsappModel.MessageText("Lo siento algo salió mal, inténtalo más tarde", number);
            models.push(model);
        }
    }
//#region chatbot
    // else if(textUser.includes("out of service")){
    //     let model = whatsappModel.MessageText(
    //         "Lamentamos mucho el inconveniente 🙂\n"+
    //         "Nuestro horario de atención es todos los días de 10:00 hrs a 21:30 hrs.\n"+
    //         "Aplican excepciones en algunos días festivos."
    //     , number);
    //     models.push(model);
    // }
    // else if(textUser.includes("hola") ||
    // textUser.includes("buenas") ||
    // textUser.includes("ola")
    // ){
    //     pizzaPromo.number = 1;
    //     const modelBuy = whatsappModel.MessageMainMenu(number);

    //     models.push(modelBuy);
    // }
    // else if(textUser.includes('ver el menú')) {
    //     const model = whatsappModel.MessageImage(number);
    //     models.push(model);
    // }
    // else if(textUser.includes('realizar pedido')) {
    //     let model = whatsappModel.MessageText("Empecemos con tu ubicación.\nPuedes mandar *manualmente tu dirección, empezando con Calle, Cerrada, Privada o Avenida* o *compartir tu ubicación.* 📍", number);
    //     models.push(model);
    // }
    // else if(textUser.includes('calle') ||
    // textUser.includes('cerrada') ||
    // textUser.includes('privada') ||
    // textUser.includes('avenida')){
    //     const model = whatsappModel.MessageLocationConfirmation(number);

    //     models.push(model);

    // }
    // else if(textUser.includes('comencemos')) {
    //     const model = whatsappModel.MessageOrderStart(number);
    //     models.push(model);
    // }
    // else if(textUser.includes('cancelar pedido')) {
    //     const model = whatsappModel.MessageText(
    //         "Estamos agradecidos, te invitamos a visitar nuestra Página de Facebook (url) o nuestro sitio Web (url).\n"+
    //         "Gracias vuelve pronto.\n"+
    //         "Pizza planeta agradece tu visita. 🖖\n"+
    //         "Loading...\n"+
    //         "Comunicación Fuera. 🛸"
    //     , number);
    //     models.push(model);
    // }
    // else if(textUser.includes('contácto tel.')) {
    //    const model = whatsappModel.MessageContact(number);
    //    models.push(model);
    // }
    // else if(textUser.includes('pizzas sencillas')){
    //     const modelList = whatsappModel.MessagePizzaSizeOneIngredient(number);
    //     models.push(modelList);

    //     cart.push({pizzaType: textUser});
    // }
    // else if(textUser.includes("sencilla") ){
    //     const modelList = whatsappModel.MessagePizzaOneIngredient(number);
    //     models.push(modelList);
    // }
    // else if(textUser.includes("pollo") ||
    // textUser.includes("salchicha") ||
    // textUser.includes("champiñón") ||
    // textUser.includes("atún") || 
    // textUser.includes("jamón")){
    //     const modelConfirmation = whatsappModel.MessageOptionsDelivery(number);
    //     models.push(modelConfirmation);
    // }
    // else if(textUser.includes('confirmar pedido')) {
    //     let modelSummary = whatsappModel.MessageText("!Excelente en un máximo de 30 minutos llegará nuestro repartidor a tu domicilio 🛵!", number);
    //     models.push(modelSummary);
    // }
    // else{
    //     const model = whatsappModel.MessageText("🤔 ¿A qué te refieres con? *"+textUser+"*", number);
    //     models.push(model);
    // }
//#endregion

    models.forEach(model => {
        whatsappService.SendMessageWhatsApp(model);
    });
}

module.exports = {
    Process
};