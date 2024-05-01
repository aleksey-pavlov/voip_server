import { MessageText } from "../../../Provider/Messages/MessagesText";
import { MessageContentBlender } from "../../../Provider/Messages/MessageContentBlender";
import { MessageWordsBlender } from "../../../Provider/Messages/MessageWordsBlender";

let contentBlender: MessageContentBlender = new MessageContentBlender();
let wordsBlender: MessageWordsBlender = new MessageWordsBlender();

let text = new MessageText('Some text for test blender message');
text = new MessageText(wordsBlender.blend(text));
text = new MessageText(contentBlender.blend(text));
console.log("----------------------------------------");
console.log(text.content);
console.log("----------------------------------------");
