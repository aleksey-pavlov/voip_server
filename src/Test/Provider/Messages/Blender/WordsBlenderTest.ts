import { MessageWordsBlender } from "../../../../Provider/Messages/MessageWordsBlender";
import { MessageText } from "../../../../Provider/Messages/MessagesText";


let blender: MessageWordsBlender = new MessageWordsBlender();

let text = new MessageText("Some text for blender test");
console.log(text);
console.log(new MessageText(blender.blend(text)));