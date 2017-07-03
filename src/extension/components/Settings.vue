<template>
  <form @submit.prevent="save" v-if="loaded" id="settings">
    <fieldset>
    <legend>Options</legend>
      <select id="color" v-model="colorSettings.favoriteColor">
      <option value="red">red</option>
      <option value="green">green</option>
      <option value="blue">blue</option>
      <option value="yellow">yellow</option>
      </select>

      <label>
        <input type="checkbox" id="like" v-model="colorSettings.likesColor">
        I like colors.
      </label>

      <div id="status"></div>
      <button id="save" type="submit">Save</button>
      <p>{{statusMsg}}</p>
    </fieldset>
  </form>
</template>

<script>
  const SETTINGS_KEY = "colorSettings"; // in chrome not needed we could direct use defaultColor as object init
  const defaultColor = {
    favoriteColor: 'red',
    likesColor: true
  };

  export default {
    data() {
      return  {
        colorSettings: defaultColor,
        statusMsg: '',
        loaded: false
      };
    },
    created() {
      this.load()
    },
    methods: {
      // plain(data) { // removes reactive data props
      //   return JSON.parse(JSON.stringify(data));
      // },
      save() {
        console.log('saving', this.colorSettings);
        // chrome.storage.sync.set(this.colorSettings, () => {
        // const update = {};
        // update[SETTINGS_KEY] = this.colorSettings;

        chrome.storage.local.set({[SETTINGS_KEY]: this.colorSettings}, () => {
          // Update status to let user know options were saved.
          console.log('saved', chrome.storage.local);
          this.statusMsg = 'Options saved.';
          setTimeout(() => {
            this.statusMsg = '';
          }, 750);
        });
      },
      load() {
        // return {colorSettings: defaultColor};
        // Use default value color = 'red' and likesColor = true.
        // chrome.storage.sync.get(defaultColor, 
        chrome.storage.local.get(SETTINGS_KEY, 
          (items) => {
            console.log('loaded', SETTINGS_KEY, items);
            // alert(JSON.stringify(items))
            this.colorSettings = items[SETTINGS_KEY] || defaultColor;
            this.loaded = true;
          });
      }
    }
  }
</script>