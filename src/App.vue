<template>
  <WakeOnLanApp />
</template>

<script>
/*import fs from 'fs';
import pathModule from 'path'
import { computed, ref } from 'vue'
import { app } from '@electron/remote'*/

import WakeOnLanApp from './components/WakeOnLanApp.vue'

export default {
  name: 'App',

  /*setup() {
    const path = ref(app.getAppPath())
    const files = computed(() => {
      const fileNames = fs.readdirSync(path.value)
      return fileNames
      .map(file => {
        const stats = fs.statSync(pathModule.join(path.value, file))
        return {
          name: file,
          size: stats.isFile() ? stats.size ?? 0 : null,
          directory: stats.isDirectory()
        }
      })
      .sort((a, b) => {
        if(a.directory === b.directory){
          return a.name.localeCompare(b.name);
        }
        return a.directory ? -1 : 1
      })
    })

    return {}
  },*/

  components: {
    WakeOnLanApp,
  },
}
</script>

<style>
:not(input):not(textarea),
:not(input):not(textarea)::after,
:not(input):not(textarea)::before {
  -webkit-user-select: none;
  user-select: none;
  cursor: default;
}
input,
button,
textarea,
:focus {
  outline: none;
}

* {
  margin: 0;
}

body {
  background-color: #0b0b0d;
}
</style>
