const AudioManager = {
    music: document.getElementById("background-music"),
    masterMusic: true,
    muted: false,
    volume: 0.5,
    sfxEnabled: true,
    sounds: {},

    startMusic() {
        if(!this.masterMusic) return;
        if(this.music.paused){
            this.music.volume = this.volume;
            this.music.muted = this.muted;
            this.music.play().catch(()=>{});
        }
    },

    updateMusicState() {
        if(!this.masterMusic){
            this.music.pause();
            return;
        }
        this.music.volume = this.volume;
        this.music.muted = this.muted;
        if(this.music.paused){
            this.music.play().catch(()=>{});
        }
    },

    toggleMute() {
        if(!this.masterMusic) return this.muted;
        this.muted = !this.muted;
        this.updateMusicState();
        return this.muted;
    },

    toggleMasterMusic() {
        this.masterMusic = !this.masterMusic;
        if(!this.masterMusic){
            this.muted = true;
        } else {
            this.muted = false;
        }
        this.updateMusicState();
        return this.masterMusic;
    },

    playSound(name){
        if(!this.sfxEnabled) return;
        if(!this.sounds[name]){
            const audio = new Audio(`../../assets/sfx/${name}.wav`);
            this.sounds[name] = audio;
        }
        const sound = this.sounds[name];
        sound.currentTime = 0;
        sound.play();
    }
};

/* ---------------- FIRST INTERACTION ---------------- */
document.addEventListener("click", function startMusic(){
    AudioManager.startMusic();
    document.removeEventListener("click", startMusic);
}, true);

/* ---------------- GLOBAL CLICK SOUND ---------------- */
document.addEventListener("mousedown",(event)=>{
    if(event.target.closest("button, a")){
        AudioManager.playSound("click");
    }
});

/* ---------------- UI ELEMENTS ---------------- */
const volumeBtn = document.getElementById("volumeBtn");
const volumeIcon = document.getElementById("volumeIcon");
const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettings = document.getElementById("closeSettings");
const masterMusicToggle = document.getElementById("masterMusicToggle");
const volumeSlider = document.getElementById("volumeSlider");
const sfxToggle = document.getElementById("sfxToggle");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const clearSettingsBtn = document.getElementById("clearSettingsBtn");

/* Export/Import elements */
const exportSaveBtn = document.getElementById("exportSaveBtn");
const importSaveBtn = document.getElementById("importSaveBtn");
const saveDataTextarea = document.getElementById("saveDataTextarea");

/* ---------------- SYNC UI ---------------- */
function updateUI() {
    if(!AudioManager.masterMusic){
        volumeIcon.textContent = "volume_off";
    } else {
        volumeIcon.textContent = AudioManager.muted ? "volume_off" : "volume_up";
    }
    masterMusicToggle.textContent = AudioManager.masterMusic ? "On" : "Off";
    volumeSlider.value = AudioManager.volume;
    sfxToggle.textContent = AudioManager.sfxEnabled ? "On" : "Off";
}

/* ---------------- VOLUME BUTTON ---------------- */
volumeBtn.onclick = ()=>{
    if(!AudioManager.masterMusic) return;
    AudioManager.toggleMute();
    updateUI();
};

/* ---------------- SETTINGS PANEL ---------------- */
settingsBtn.onclick = ()=>{
    settingsPanel.classList.remove("hidden");
    settingsPanel.querySelector(".settings-box").classList.add("slideIn");
};
closeSettings.onclick = ()=>{
    settingsPanel.classList.add("hidden");
    settingsPanel.querySelector(".settings-box").classList.remove("slideIn");
};

/* ---------------- MASTER MUSIC ---------------- */
masterMusicToggle.onclick = ()=>{
    AudioManager.toggleMasterMusic();
    updateUI();
};

/* ---------------- VOLUME SLIDER ---------------- */
volumeSlider.oninput = ()=>{
    AudioManager.volume = parseFloat(volumeSlider.value);
    AudioManager.updateMusicState();
};

/* ---------------- SFX TOGGLE ---------------- */
sfxToggle.onclick = ()=>{
    AudioManager.sfxEnabled = !AudioManager.sfxEnabled;
    updateUI();
};

/* ---------------- SAVE / CLEAR ---------------- */
saveSettingsBtn.onclick = saveSettings;
clearSettingsBtn.onclick = ()=>{
    localStorage.removeItem("cozySettings");
    AudioManager.masterMusic = true;
    AudioManager.muted = false;
    AudioManager.volume = 0.5;
    AudioManager.sfxEnabled = true;
    AudioManager.updateMusicState();
    updateUI();
};

/* ---------------- SAVE SETTINGS FUNCTION ---------------- */
function saveSettings(){
    const settings = {
        masterMusic: AudioManager.masterMusic,
        muted: AudioManager.muted,
        sfx: AudioManager.sfxEnabled,
        volume: AudioManager.volume
    };
    localStorage.setItem("cozySettings", JSON.stringify(settings));
}

/* ---------------- LOAD SETTINGS ---------------- */
function loadSettings(){
    const data = localStorage.getItem("cozySettings");
    if(!data) return;
    const settings = JSON.parse(data);
    AudioManager.masterMusic = settings.masterMusic;
    AudioManager.muted = settings.muted;
    AudioManager.sfxEnabled = settings.sfx;
    AudioManager.volume = settings.volume;
    AudioManager.updateMusicState();
}
loadSettings();
updateUI();

/* ---------------- EXPORT SAVE ---------------- */
exportSaveBtn.onclick = () => {
    const settings = {
        masterMusic: AudioManager.masterMusic,
        muted: AudioManager.muted,
        sfx: AudioManager.sfxEnabled,
        volume: AudioManager.volume
    };
    saveDataTextarea.value = JSON.stringify(settings);
    saveDataTextarea.select();
    document.execCommand("copy");
    alert("Save exported! You can copy it.");
};

/* ---------------- IMPORT SAVE ---------------- */
importSaveBtn.onclick = () => {
    const data = saveDataTextarea.value.trim();
    if(!data) return alert("Please paste a valid save string.");
    try {
        const settings = JSON.parse(data);

        if(typeof settings.masterMusic !== "boolean" ||
           typeof settings.muted !== "boolean" ||
           typeof settings.sfx !== "boolean" ||
           typeof settings.volume !== "number") {
            throw new Error("Invalid format");
        }

        AudioManager.masterMusic = settings.masterMusic;
        AudioManager.muted = settings.muted;
        AudioManager.sfxEnabled = settings.sfx;
        AudioManager.volume = settings.volume;
        AudioManager.updateMusicState();
        updateUI();
        saveSettings();
        alert("Save imported successfully!");
    } catch(e) {
        alert("Failed to import save: Invalid data.");
        console.error(e);
    }
};

/* -------------- INITIATE TRANSITION -------------- */
function initiateTransition(event){
    if(event && typeof event.preventDefault === "function"){
        event.preventDefault();
    }

    const transition = document.getElementById("transition-screen");
    if(!transition) return;

    transition.classList.add("show");
    setTimeout(()=>{
        window.location.href = "../cozy-restaurant-game/main_restaurant/main_restaurant.html";
    }, 2500);
}