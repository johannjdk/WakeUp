<template>
  <div v-if="page === 'main' && Object.keys(getData()).length > 0" class="main">
    <div class="container">
      <h1 class="title">WakeUp</h1>
      <form class="form">
        <div class="form-group" style="text-align: center;">
          <p for="mac-address" class="secondary">Wähle ein Gerät</p>
          <div class="select-wrapper">
            <select v-model="selEntry" id="mac-address" class="select">
              <option
                v-for="name in Object.entries(getData())"
                :value="name[0]"
                :key="name[0]"
              >
                {{ name[0] }}
              </option>
            </select>
            <div class="select-arrow"></div>
          </div>
          <div style="margin-top: 20px;">
            <p v-if="selEntry != ''" type="text" disabled style="font-size: 14px; color: gray;">MAC-Adresse: {{ this.getData()[selEntry] }}</p>
          </div>
        </div>
        <button
          type="button"
          @click="sendMagicPacket(selEntry)"
          id="send-magic-packet"
          class="button button-packet"
        >
          Gerät einschalten
        </button>
        <button
          type="button"
          @click="switchPage()"
          id="send-magic-packet"
          class="button button-add"
        >
          Eintrag hinzufügen
        </button>

        <button
          type="button"
          @click="deleteMacAddress(selEntry)"
          id="send-magic-packet"
          class="button button-remove"
        >
          Eintrag löschen
        </button>
      </form>
    </div>
  </div>

  <div v-if="page === 'add' || Object.keys(getData()).length <= 0" class="main">
    <div class="container">
      <h1 class="title">WakeUp</h1>
      <form class="form">
        <div class="form-group" style="text-align: center;">
          <p for="mac-address" class="secondary">
            Erstelle einen neuen Eintrag
          </p>
          <div class="input-wrapper">
            <label class="label">Name</label>
            <input v-model="newName" type="text" name="" id="" />
          </div>
          <div class="input-wrapper">
            <label class="label">MAC-Adresse</label>
            <input v-model="newMacAddress" type="text" name="" id="" />
          </div>
        </div>
        <p style="color: red;">{{ newErrMSG }}</p>
        <button
          type="button"
          @click="createNewMac()"
          id="send-magic-packet"
          class="button button-packet"
        >
          Eintragen
        </button>
        <button
          v-if="Object.keys(this.getData()).length > 0"
          type="button"
          @click="switchPage()"
          id="send-magic-packet"
          class="button button-back"
        >
          Zurück
        </button>
      </form>
    </div>
  </div>
</template>

<script>
const { remote } = require('electron')
const win = remote.getCurrentWindow()
//import wakeonlan from 'wakeonlan';

export default {
  name: 'WakeOnLanApp',

  data() {
    return {
      page: 'main',

      newMacAddress: '',
      newName: '',
      newErrMSG: '',

      selEntry: undefined,
    }
  },

  methods: {
    switchPage(page) {
      //const electron = require('electron')
      //var remote = require('electron').remote

      if (this.page === 'main') {
        this.page = 'add'
      } else {
        this.page = 'main'
      }

      if(page !== undefined){
        this.page = page
      }


      if(Object.keys(this.getData()).length <= 0){
        this.page = 'main'
      }

      this.refresh()
    },

    deleteMacAddress(name) {
      var data = this.getData()
      delete data[name]

      this.saveData(data)

      this.refresh()
    },

    getData() {
      const os = require('os')
      const userHomeDir = os.homedir()
      const fs = require('fs')
      const fileLoc = userHomeDir + '/WakeUp/data.json'
      var data = fs.readFileSync(fileLoc, { encoding: 'utf8' })

      try {
        JSON.parse(data)
      } catch (e) {
        fs.writeFileSync(fileLoc, JSON.stringify({}))
        data = '{}'
      }

      return JSON.parse(data)
    },

    saveData(data) {
      const os = require('os')
      const userHomeDir = os.homedir()
      const fs = require('fs')
      const fileLoc = userHomeDir + '/WakeUp/data.json'

      const dirLoc = userHomeDir + '/WakeUp/'

      if (!fs.existsSync(fileLoc)) {
        if (!fs.existsSync(dirLoc)) {
          fs.mkdirSync(dirLoc)
        }
        fs.writeFileSync(fileLoc, JSON.stringify({}))
      } else {
        fs.writeFileSync(fileLoc, JSON.stringify(data, null, 2))
      }
    },

    isValidMacAddress(mac) {
      const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
      return macRegex.test(mac)
    },

    sendMagicPacket(macAddress) {
      if (macAddress != '') {
        var data = this.getData()
        macAddress = data[macAddress]

        const dgram = require('dgram')
        const electron = require('electron')
        const macBytes = macAddress
          .split(/[-:]/)
          .map((byte) => parseInt(byte, 16))
        const buffer = Buffer.alloc(102)

        // Add the magic packet header
        buffer.fill(0xff, 0, 6)
        // Repeat the MAC address 16 times
        for (let i = 6; i < buffer.length; i += 6) {
          macBytes.forEach((byte, index) => {
            buffer[i + index] = byte
          })
        }

        // Send the magic packet as a UDP datagram to the broadcast address
        const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true })
        socket.bind(() => {
          socket.setBroadcast(true)
          socket.send(buffer, 0, buffer.length, 9, '255.255.255.255', (err) => {
            socket.close()
            if (err) {
              console.error('Error sending magic packet:', err)
            } else {
              console.log('Magic packet sent successfully to', macAddress)
              /*new electron.remote.Notification({
                title: 'Erfolg!',
                body:
                  'Du hast erfolgreich ein Magic-Packet an ' +
                  this.selEntry +
                  ' gesendet.',
              }).show()*/

              electron.remote.dialog.showMessageBox(electron.getCurrentWindow, {
                title: 'Erfolg',
                message:
                  'Du hast erfolgreich ein Magic-Packet an "' +
                  this.selEntry +
                  '" gesendet.',
                detail: macAddress,
              })
            }
          })
        })
      }
    },

    createNewMac() {
      if (
        this.newMacAddress.trim().length !== 0 &&
        this.newName.trim().length !== 0
      ) {
        if (this.isValidMacAddress(this.newMacAddress)) {
          this.newErrMSG = ''
          this.addMacAddress(this.newName, this.newMacAddress)
          this.newName = ''
          this.newMacAddress = ''
          this.switchPage('main')
        } else {
          this.newErrMSG = 'Die eingegebene MAC-Adresse ist ungültig!'
        }
      } else {
        this.newErrMSG = 'Du musst alle Felder ausfüllen!'
      }
    },

    addMacAddress(name, mac) {
      var data = this.getData()

      data[name] = mac

      this.saveData(data)
      this.refresh()
    },

    refresh() {
      if (
        Object.entries(this.getData())[0] !== undefined &&
        Object.entries(this.getData())[0][0] !== undefined
      ) {
        this.selEntry = Object.entries(this.getData())[0][0]
      } else {
        this.selEntry = ''
      }

      win.setTitle('WakeUp')
      if (this.page === 'main') {
        win.setTitle('WakeUp - Hauptmenü')
      }
      if (this.page === 'add') {
        win.setTitle('WakeUp - Eintrag hinzufügen')
      }
    },
  },

  mounted() {
    this.refresh()
  },

  beforeCreate() {
    const os = require('os')
    const userHomeDir = os.homedir()
    const fs = require('fs')

    const fileLoc = userHomeDir + '/WakeUp/data.json'
    const dirLoc = userHomeDir + '/WakeUp/'

    if (!fs.existsSync(fileLoc)) {
      if (!fs.existsSync(dirLoc)) {
        fs.mkdirSync(dirLoc)
      }
      fs.writeFileSync(fileLoc, JSON.stringify({}))
    }

    var data = fs.readFileSync(fileLoc, { encoding: 'utf8' })

    try {
      JSON.parse(data)
    } catch (e) {
      fs.writeFileSync(fileLoc, JSON.stringify({}))
    }
  },
}
</script>

<style>
* {
  margin: 0;
}
</style>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

.main {
  background-color: #0b0b0d;
  font-family: sans-serif;
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  opacity: 100%;
  animation: containerIn 0.7s;
}

@keyframes containerIn {
  0% {
    opacity: 0%;
  }
  15% {
    opacity: 0%;
  }
  100% {
    opacity: 100%;
  }
}

.title {
  color: #fff;
  font-size: 3rem;
  margin-bottom: 2rem;
}

.form {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.secondary {
  color: #c2bfbf;
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.select-wrapper {
  position: relative;
  width: 100%;
}

.input-wrapper {
  position: relative;
  width: 100%;
  margin-top: 25px;
  margin-bottom: 5px;
}

.select {
  appearance: none;
  background-color: #1c1c1e;
  border: 1px solid #ccc;
  color: #fff;
  font-size: 16px;
  padding: 1rem 2rem;
  width: 100%;
  border-color: transparent;
  transition: 0.3s ease-in-out;
  border-radius: 4px;
}

.select:focus {
  background-color: #1c1c1e;
  outline: none;
  border-color: #3ea24f;
  color: #ece7d1;
}

.select:hover {
  background-color: #1c1c1e;
  outline: none;
  border-color: #3ea24f;
  color: #ece7d1;
}

input[type='text'] {
  background-color: #1c1c1e;
  font-family: Arial, sans-serif;
  font-size: 16px;
  color: #ffffff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  box-sizing: border-box;
  width: 100%;
  margin-bottom: 10px;
  transition: 0.3s ease-in-out;
  border-color: transparent;
  text-align: center;
}

input[type='text']:focus {
  background-color: #1c1c1e;
  outline: none;
  border-color: #3ea24f;
  color: #7fbd7f;
}

input[type='text']:hover {
  background-color: #1c1c1e;
  outline: none;
  border-color: #3ea24f;
  color: #7fbd7f;
}

.select-arrow {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 0.5rem solid transparent;
  border-right: 0.5rem solid transparent;
  border-top: 0.5rem solid #fff;
}

.button {
  background-color: #1c1c1e;
  border: none;
  border-radius: 2rem;
  color: #fff;
  font-size: 1.5rem;
  padding: 1rem 2rem;
  margin-top: 2rem;
  cursor: pointer;
  transition: 0.2s ease-in-out;
}

.button-packet {
  background-color: #538f60;
  transition: 0.2s ease-in-out;
}

.button-add {
  transition: 0.2s ease-in-out;

  font-size: 12px;
  padding: 0.4rem 0.8rem;

  position: fixed;
  top: 87vh;
  right: 10px;
}

.button-back {
  transition: 0.2s ease-in-out;

  font-size: 12px;
  padding: 0.4rem 0.8rem;

  position: fixed;
  top: 87vh;
  right: 10px;
}
.button-remove {
  background-color: #744747;
  transition: 0.2s ease-in-out;
  font-size: 12px;
  padding: 0.4rem 0.8rem;

  position: fixed;
  top: 87vh;
  left: 10px;
}

.button:hover {
  background-color: #444449;
}
.button-packet:hover {
  background-color: #3ea24f;
}

.button-remove:hover {
  background-color: #bb5454;
}

.label {
  color: rgb(203, 203, 203);
}
</style>
