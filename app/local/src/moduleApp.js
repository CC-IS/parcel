import {thisThing} from './test2.js';
import {Button} from '../../common/src/muse/components/button_module.js'

import {remote} from 'electron'

console.log(remote);

export let app = {
  start:()=>{
    console.log(thisThing);
  },
}
