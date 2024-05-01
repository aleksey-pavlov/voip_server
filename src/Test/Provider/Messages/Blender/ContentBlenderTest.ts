import { MessageText } from "../../../../Provider/Messages/MessagesText";
import { MessageContentBlender } from "../../../../Provider/Messages/MessageContentBlender";


let blender: MessageContentBlender = new MessageContentBlender();

let text = new MessageText("Sale");
console.log(text);
console.log(new MessageText(blender.blend(text)));