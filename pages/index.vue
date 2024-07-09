<script setup>
import { Profanity, ProfanityOptions } from '@2toad/profanity'
import CardIcon from '~/components/CardIcon.vue'
import { EmailValidator, CVCValidator, ExpiryDateValidator, CreditCardValidator } from 'assets/js/validators.js'
import JSConfetti from 'js-confetti'

//******** OG IMAGE SHIZZLE HERE ****************//

// check if there is a parameter

defineOgImageComponent('NuxtSeo', {
  title: 'Hello OG Image 👋',
  description: 'Look what at me in dark mode',
  theme: '#ff0000',
  colorMode: 'dark',
})

//******** OG IMAGE SHIZZLE ENDS HERE ****************//

//******** LEADEROROROBOARDODODO ****************//

// Initialize Profanity filter
const options = new ProfanityOptions()
options.wholeWord = false // Set to false to catch partial matches
const profanity = new Profanity(options)

// Add custom words to the profanity filter
profanity.addWords(['paddle'])

const isBrowser = typeof window !== 'undefined'
const username = ref(isBrowser ? localStorage.getItem('username') || '' : '')
const isUsernameSubmitted = ref(isBrowser ? JSON.parse(localStorage.getItem('isUsernameSubmitted')) || false : false) // Load from localStorage
const isUsernameDisabled = computed(() => isUsernameSubmitted.value) // Update computed property
const leaderboard = ref([])

// const leaderboard = ref([
//   { id: 1, username: 'sobedominik', time: 5.23, mode: 'full' },
//   { id: 2, username: 'erwinai', time: 6.45, mode: 'card' },
//   { id: 3, username: 'yomamamfast', time: 7.89, mode: 'full' },
// ])

const currentLeaderboardMode = ref('full')

const fetchLeaderboard = async () => {
  console.log('Fetching leaderboard...')
  try {
    nextTick(async () => {
      const { data, error } = await useFetch('/api/leaderboard')
      if (error.value) {
        console.error('Error fetching leaderboard:', error.value)
        leaderboard.value = [] // Initialize as an empty array on error
      } else {
        console.log('Leaderboard fetched:', data.value)
        leaderboard.value = data.value || [] // Ensure it's an array
      }
    })
  } catch (err) {
    console.error('Unexpected error fetching leaderboard:', err)
    leaderboard.value = [] // Initialize as an empty array on error
  }
}

const filteredLeaderboard = computed(() => {
  console.log('Filtering leaderboard:', leaderboard.value)
  console.log('Current mode:', currentLeaderboardMode.value)
  return leaderboard.value.filter((entry) => {
    console.log('Entry mode:', entry.mode)
    return entry.mode === currentLeaderboardMode.value
  })
})

const isScoreSubmitted = ref(false)
const isLoadingSubmission = ref(false)

const submitScore = async () => {
  if (!username.value) return
  isLoadingSubmission.value = true
  const jsConfetti = new JSConfetti()
  const newEntry = {
    username: username.value,
    time: timer.value.getTime(),
    mode: gameMode.value,
  }

  const { data, error } = await useFetch('/api/leaderboard', {
    method: 'POST',
    body: newEntry,
  })

  if (!error.value) {
    // Check if the username already exists in the leaderboard for the current game mode
    const existingEntryIndex = leaderboard.value.findIndex((entry) => entry.username === username.value && entry.mode === gameMode.value)

    if (existingEntryIndex !== -1) {
      // Update the existing entry
      leaderboard.value[existingEntryIndex] = data.value
    } else {
      // Add a new entry
      leaderboard.value.push(data.value)
    }

    leaderboard.value.sort((a, b) => a.time - b.time)

    localStorage.setItem('username', username.value) // Store username in localStorage
    isUsernameSubmitted.value = true // Set to true after successful submission
    localStorage.setItem('isUsernameSubmitted', JSON.stringify(true)) // Persist state in localStorage
    isScoreSubmitted.value = true
    jsConfetti.addConfetti({
      emojis: ['💳', '💰', '💰', '💸', '💵', '💶', '💷', '💳'],
    })
    setTimeout(() => {
      jsConfetti.clearCanvas()
    }, 5000)
  } else {
    console.error('Error submitting score:', error.value)
    alert('Error submitting your score, please try again later pal 😬 We are not getting paid enough (at all) for this. Bear with us ✌️')
  }
  isLoadingSubmission.value = false
}

const timer = ref()
const concludingMessage = ref('GOGoGOGO11!1!! Ur product manager and a senior engineer are already judging you.')
const showConcludingMessage = ref(false)
const hasAcceptedTerms = ref(false)
const hasPlayedGame = ref(false)
const gameMode = ref('full')
const shareShortCode = ref('')

const inputEmail = ref('')
const inputEmailInvalid = ref('')
const inputCardNumber = ref('')
const inputCardNumberInvalid = ref('')
const inputExpiry = ref('')
const inputExpiryInvalid = ref('')
const inputCvc = ref('')
const inputCvcInvalid = ref('')
const inputName = ref('')
const inputCountry = ref('')
const inputAddressOne = ref('')
const inputAddressTwo = ref('')
const inputCity = ref('')
const inputZipCode = ref('')

const cardType = ref('')
const cardDeclineCode = ref('')
const cardErrorCode = ref('')

const inputDeclaredValid = ref(false)

const inputValidators = {
  email: new EmailValidator(),
  expiry: new ExpiryDateValidator(),
  cvc: new CVCValidator(),
  card: new CreditCardValidator(),
}

const isGameModeFull = computed(() => gameMode.value === 'full')
const isGameModeCard = computed(() => gameMode.value === 'card')

/*
TODO:
 - Build overview of favorite indie hackers, products, and tools
 - Save data to DB (score / mode / time / unique shortcode)
 - Make OG image generation using shortcode
 - Make URL shortcut for sharing with shortcode
 - Build "share your score" button
 - Make a leaderboard (?)
 */

// make a special watch for the expiry date, if there are two digits typed, add a slash automatically.
// if the backspace is used, remove the slash and 2nd digit (both), as if the slash didn't exist.
const onInput = (event) => {
  let value = event.target.value

  // Remove non-numeric characters except slash
  value = value.replace(/[^\d\/]/g, '')

  // Handle adding slash
  if (value.length === 2 && !value.includes('/')) {
    value += '/'
  }

  // Ensure maximum length of 5 characters (MM/YY)
  if (value.length > 5) {
    value = value.slice(0, 5)
  }

  inputExpiry.value = value
}

const onKeydown = (event) => {
  if (event.key === 'Backspace') {
    const value = inputExpiry.value
    if (value.length === 3 && value.charAt(2) === '/') {
      inputExpiry.value = value.slice(0, 2)
      event.preventDefault() // Prevent default backspace behavior
    }
  }
}

onMounted(async () => {
  const cardIcons = document.querySelectorAll('.card-icon')
  let currentIndex = 0

  function showNextIcon() {
    cardIcons[currentIndex].classList.remove('opacity-100', 'scale-100')
    cardIcons[currentIndex].classList.add('opacity-0', 'scale-[0.9]')

    currentIndex = (currentIndex + 1) % cardIcons.length

    cardIcons[currentIndex].classList.remove('opacity-0', 'scale-[0.9]')
    cardIcons[currentIndex].classList.add('opacity-100', 'scale-100')
  }

  setInterval(showNextIcon, 2000)

  //watch whether hasAcceptedTerms goes to true
  watch(hasAcceptedTerms, (value) => {
    if (value) {
      timer.value = new Timer()
    }
  })

  // // Fetch leaderboard from localStorage if available
  // const storedLeaderboard = JSON.parse(localStorage.getItem('leaderboard'))
  // if (storedLeaderboard) {
  //   leaderboard.value = storedLeaderboard
  // }

  // watch(
  //   leaderboard,
  //   (newLeaderboard) => {
  //     // Store leaderboard in localStorage
  //     localStorage.setItem('leaderboard', JSON.stringify(newLeaderboard))
  //   },
  //   { deep: true }
  // )
  // Watch for changes in the username input
  watch(username, (newValue) => {
    // Remove spaces
    username.value = newValue.replace(/\s/g, '')

    // Check for profanity
    if (profanity.exists(username.value)) {
      alert('Please avoid using inappropriate words in your username.')
      username.value = ''
    }
  })
  await fetchLeaderboard()
})

const startGame = () => {
  if (hasAcceptedTerms.value) {
    timer.value.start()
  }
}

const stopGame = () => {
  hasPlayedGame.value = true
  timer.value.stop()

  const outcome = validateResults()

  if (outcome) {
  }
}

const shareGame = async () => {
  shareShortCode.value = ''

  // Grab score in seconds and a placeholder name
  const score = timer.value.getTime()
  const name = 'Erwin'
  const data = { score, name }

  try {
    // Use $fetch to call the encrypt API
    const { data: response, error } = await useFetch('/api/encrypt', {
      method: 'POST',
      body: { code: JSON.stringify(data) },
    })

    if (error.value) {
      console.log(error.value)
      //TODO: someone trying to cheat and just giv random code? hell nah
    }

    // Store the encrypted shortcode
    shareShortCode.value = response.value.encryptedCode
    console.log('Encrypted Shortcode:', response.value.encryptedCode)
  } catch (error) {
    console.error('Error encrypting game data:', error)
    shareShortCode.value = null
  }
}

const restartGame = () => {
  hasPlayedGame.value = false
  showConcludingMessage.value = false

  timer.value = new Timer()

  cardType.value = ''
  cardDeclineCode.value = ''
  cardErrorCode.value = ''

  inputCardNumber.value = ''
  inputCardNumberInvalid.value = ''
  inputExpiry.value = ''
  inputExpiryInvalid.value = ''
  inputCvc.value = ''
  inputCvcInvalid.value = ''

  // should only be filled with gamemode full but just reset anyway
  inputEmail.value = ''
  inputEmailInvalid.value = ''
  inputName.value = ''
  inputCountry.value = ''
  inputAddressOne.value = ''
  inputAddressTwo.value = ''
  inputCity.value = ''
  inputZipCode.value = ''
  isUsernameSubmitted.value = false
  isScoreSubmitted.value = false
  localStorage.setItem('isUsernameSubmitted', JSON.stringify(false))
}

const disableInputs = computed(() => {
  return !hasAcceptedTerms.value || hasPlayedGame.value
})

const limitCardNumberLength = () => {
  if (inputCardNumber.value.length > 16) {
    inputCardNumber.value = inputCardNumber.value.slice(0, 16)
  }
}

const validateResults = () => {
  // first, we need to validate all inputs if they aren't empty
  if (
    (isGameModeFull.value &&
      (inputEmail.value === '' ||
        inputCardNumber.value === '' ||
        inputExpiry.value === '' ||
        inputCvc.value === '' ||
        inputName.value === '' ||
        inputCountry.value === '' ||
        inputAddressOne.value === '' ||
        inputCity.value === '' ||
        inputZipCode.value === '')) ||
    (isGameModeCard.value && (inputCardNumber.value === '' || inputExpiry.value === '' || inputCvc.value === ''))
  ) {
    concludingMessage.value = "Oh rekt you didn't fill all inputs lmao"
    showConcludingMessage.value = true
    inputDeclaredValid.value = false
    return
  }

  // then we check if Email, expiry, cvc are of the right formatting
  if (isGameModeFull.value && !inputValidators.email.isValid(inputEmail.value)) {
    inputEmailInvalid.value = 'check ur @ and .com, fam. this email is broken'
    concludingMessage.value = 'Ur formatting is wrong m8'
  }

  if (!inputValidators.expiry.isValid(inputExpiry.value)) {
    // split on the slash, grab the end part (the year) and convert it to a full year (based on 20 only)
    const expiryParts = inputExpiry.value.split('/')
    const year = expiryParts[1].length === 2 ? '20' + expiryParts[1] : expiryParts[1]

    if (year < new Date().getFullYear()) {
      inputExpiryInvalid.value = `Ehh.. ${year} called, they want your card back cause it's EXPIRED.`
    } else {
      inputExpiryInvalid.value = `Yeah nah that's not a valid expiry date.. try again.`
    }

    concludingMessage.value = 'Ur formatting is wrong m8'
  }

  if (!inputValidators.cvc.isValid(inputCvc.value)) {
    inputCvcInvalid.value = '(>.>) That is not a valid cvc. Get your head in the game.'
    concludingMessage.value = 'Ur formatting is wrong m8'
  } else {
    // if it's certain numbers
    /*
    007 - "Bond, James Bond."
    123 - "Easy as 1-2-3!"
    404 - "CVC Not Found. Try again."
    666 - "Devilish choice, aren't we?"
    777 - "Lucky number! Jackpot!"
    911 - "Call for help! CVC emergency!"
     */
  }

  const cardValidationOutcome = inputValidators.card.validate(inputCardNumber.value)
  if (!cardValidationOutcome.isValid) {
    cardDeclineCode.value = cardValidationOutcome.declineCode
    cardErrorCode.value = cardValidationOutcome.errorCode
    inputCardNumberInvalid.value =
      "That's not a test card, it says error code" + cardErrorCode.value + (cardDeclineCode.value ? ' because ' + cardDeclineCode.value : '.')
    concludingMessage.value = 'Ur formatting is wrong m8'
  } else {
    // save the validationOutcome card type
    cardType.value = cardValidationOutcome.cardType
  }

  // do a final check if anything is invalid. If not, show success messages depending on the time
  if ((isGameModeFull.value && inputEmailInvalid.value) || inputCardNumberInvalid.value || inputExpiryInvalid.value || inputCvcInvalid.value) {
    showConcludingMessage.value = true
    inputDeclaredValid.value = false
    return false
  } else {
    // Different messages every 2 seconds of timer.value.getTime. Lower is better
    if ((isGameModeFull.value && timer.value.getTime() < 3) || (isGameModeCard.value && timer.value.getTime() < 1)) {
      concludingMessage.value = "Ehhh are you sure you didn't cheat??"
    } else if ((isGameModeFull.value && timer.value.getTime() < 6) || (isGameModeCard.value && timer.value.getTime() < 2)) {
      concludingMessage.value = 'Absolute f$#cking legend! I bet your code must compile before you even type haha!'
    } else if ((isGameModeFull.value && timer.value.getTime() < 8) || (isGameModeCard.value && timer.value.getTime() < 3)) {
      concludingMessage.value = 'You have a keyboard with keys that type a whole credit card at once or smth lawl??'
    } else if ((isGameModeFull.value && timer.value.getTime() < 10) || (isGameModeCard.value && timer.value.getTime() < 4)) {
      concludingMessage.value =
        "Absolute fire but maybe try again cause there's more fun messages lol pls try harder and read those, took me so long to come up with them =')"
    } else if ((isGameModeFull.value && timer.value.getTime() < 13) || (isGameModeCard.value && timer.value.getTime() < 5)) {
      concludingMessage.value = "HMMMMMRRR! Ur blazin' there wow but can you like, try harder?! I want you to see the messages for <8sec"
    } else if ((isGameModeFull.value && timer.value.getTime() < 16) || (isGameModeCard.value && timer.value.getTime() < 6)) {
      concludingMessage.value = "Sick score but don't share this because your friends might unfollow you, you can do better!"
    } else if ((isGameModeFull.value && timer.value.getTime() < 19) || (isGameModeCard.value && timer.value.getTime() < 7)) {
      concludingMessage.value = 'Pretty fast. Did you grease up your keyboard before attempting this round?'
    } else if ((isGameModeFull.value && timer.value.getTime() < 22) || (isGameModeCard.value && timer.value.getTime() < 8)) {
      concludingMessage.value = 'Eh oke nice I guess haha but try harder okay?'
    } else if ((isGameModeFull.value && timer.value.getTime() < 25) || (isGameModeCard.value && timer.value.getTime() < 10)) {
      concludingMessage.value = "This is average what were you doing? Can't afford typo's okay try again."
    } else if ((isGameModeFull.value && timer.value.getTime() < 28) || (isGameModeCard.value && timer.value.getTime() < 11)) {
      concludingMessage.value = 'LOL did you forget to turn on your keyboard or smth?'
    } else if ((isGameModeFull.value && timer.value.getTime() < 31) || (isGameModeCard.value && timer.value.getTime() < 12)) {
      concludingMessage.value = "Mate were you looking up validation rules on stack overflow first? C'mon this is too slow!"
    } else if ((isGameModeFull.value && timer.value.getTime() < 34) || (isGameModeCard.value && timer.value.getTime() < 13)) {
      concludingMessage.value = 'Did you get scared? Cause your keyboard seems to be ghost typing LOL this is way too slow try again'
    } else if ((isGameModeFull.value && timer.value.getTime() < 37) || (isGameModeCard.value && timer.value.getTime() < 14)) {
      concludingMessage.value = 'I ran out of things to say here like srsly what are you doing???!'
    } else if ((isGameModeFull.value && timer.value.getTime() < 40) || (isGameModeCard.value && timer.value.getTime() < 15)) {
      concludingMessage.value = "Ugh at this point I think maybe you're typing with your feet or smth wtf is this???"
    } else {
      concludingMessage.value = "You're not even trying anymore are you? I'm disappointed. Hand in your programmer badge NOW."
    }

    showConcludingMessage.value = true
    inputDeclaredValid.value = true
    return true
  }
}

class Timer {
  constructor() {
    this.startTime = 0
    this.elapsedTime = 0
    this.running = false
    this.rafId = null
  }

  start() {
    if (this.running) return // Prevent multiple starts

    this.running = true
    this.startTime = performance.now() - this.elapsedTime // Adjust start time based on elapsed time
    this.rafId = requestAnimationFrame(this.update.bind(this)) // Start the animation frame loop
  }

  stop() {
    if (!this.running) return // If not running, do nothing

    this.running = false
    cancelAnimationFrame(this.rafId) // Stop the animation frame loop
    this.rafId = null
  }

  update() {
    if (!this.running) return // If not running, stop updating

    this.elapsedTime = performance.now() - this.startTime // Calculate elapsed time
    this.rafId = requestAnimationFrame(this.update.bind(this)) // Continue the animation frame loop
  }

  getTime() {
    return this.elapsedTime / 1000 // Return the current time in seconds
  }

  hasBeenActivated() {
    return this.elapsedTime > 0
  }

  hasStopped() {
    return this.hasBeenActivated && !this.running
  }

  isRunning() {
    return this.running
  }
}
</script>

<template>
  <div class="h-full min-h-screen h-100% relative">
    <div v-if="username" class="absolute top-3 left-3 border-2 border-white/50 rounded-full px-1.5 py-0.5 text-xs text-white font-mono">
      @{{ username }}
    </div>
    <div class="flex flex-col h-full lg:flex-row">
      <div class="lg:w-[40%] flex bg-indigo-600 font-mono text-white p-4">
        <div class="flex flex-col justify-between grow">
          <div class="w-full grow">
            <h1 class="mt-8 text-3xl text-center lg:mt-16">4242.pro</h1>

            <p class="mx-4 my-3 text-center">👀 Let's see if ur a 10x engineer or a n00b, your goal is to fill this checkout form asap.</p>

            <!-- BEFORE GAME / ACCEPTING TERMS -->
            <template v-if="!hasAcceptedTerms">
              <p class="mx-4 mt-16 mb-2 italic text-center">
                First, please click the button below to confirm you understand this is a GAME and not REAL. If you enter your real CC details, perhaps
                I will charge you! Don't gamble, be warned. Okay now that you have read this, click the button below and show me ur sk1lz.
              </p>
              <button @click="hasAcceptedTerms = true" class="flex px-4 py-2 mx-auto mt-4 text-indigo-600 bg-white rounded-lg">
                Yes, I understand the above m8 dw
              </button>
            </template>

            <!-- CURRENT STATE OR OUTCOME OF GAME -->
            <template v-else>
              <div class="flex items-center justify-center mx-auto mt-8 mb-5 font-bold text-center text-white">↓ Pick your game mode ↓</div>
              <div class="grid max-w-sm grid-cols-2 mx-auto gap-x-2">
                <div
                  class="flex items-center justify-center px-4 py-2 border-white cursor-pointer"
                  @click=";(gameMode = 'full'), (currentLeaderboardMode = 'full')"
                  :class="isGameModeFull ? 'border-2 text-white bg-indigo-700' : 'text-gray-400 hover:border-2'"
                >
                  <svg class="mr-2 size-4" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="currentColor">
                      <path
                        d="M20.016 2C18.903 2 18 4.686 18 8h2.016c.972 0 1.457 0 1.758-.335c.3-.336.248-.778.144-1.661C21.64 3.67 20.894 2 20.016 2"
                      />
                      <path
                        d="M18 8.054v10.592c0 1.511 0 2.267-.462 2.565c-.755.486-1.922-.534-2.509-.904c-.485-.306-.727-.458-.996-.467c-.291-.01-.538.137-1.062.467l-1.911 1.205c-.516.325-.773.488-1.06.488s-.545-.163-1.06-.488l-1.91-1.205c-.486-.306-.728-.458-.997-.467c-.291-.01-.538.137-1.062.467c-.587.37-1.754 1.39-2.51.904C2 20.913 2 20.158 2 18.646V8.054c0-2.854 0-4.28.879-5.167C3.757 2 5.172 2 8 2h12M6 6h8m-6 4H6"
                      />
                      <path
                        d="M12.5 10.875c-.828 0-1.5.588-1.5 1.313c0 .724.672 1.312 1.5 1.312s1.5.588 1.5 1.313c0 .724-.672 1.312-1.5 1.312m0-5.25c.653 0 1.209.365 1.415.875m-1.415-.875V10m0 6.125c-.653 0-1.209-.365-1.415-.875m1.415.875V17"
                      />
                    </g>
                  </svg>
                  Full form
                </div>

                <div
                  class="flex items-center justify-center px-4 py-2 border-white cursor-pointer"
                  @click=";(gameMode = 'card'), (currentLeaderboardMode = 'card')"
                  :class="isGameModeCard ? 'border-2 text-white bg-indigo-700' : 'text-gray-400 hover:border-2'"
                >
                  <svg class="mr-2 size-4" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16">
                    <g fill="currentColor">
                      <path
                        d="M14 3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"
                      />
                      <path
                        d="M2 5.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5"
                      />
                    </g>
                  </svg>
                  Card only
                </div>
              </div>

              <template v-if="!timer.hasBeenActivated() || timer.isRunning() || (timer.hasStopped() && inputDeclaredValid)">
                <p class="mt-8 text-4xl text-center lg:mt-32">{{ timer ? timer.getTime().toFixed(5) : '' }} seconds</p>
                <button v-if="!shareShortCode" @click="shareGame()" class="flex px-4 py-2 mx-auto mt-4 text-indigo-600 bg-white rounded-lg">
                  Share! (experiment)
                </button>
                <p v-if="shareShortCode" class="mt-2 text-sm italic text-center break-all">
                  Here is your shareable link:
                  <a :href="'https://4242.pro/s/' + shareShortCode" target="_blank" class="underline">https://4242.pro/s/{{ shareShortCode }}</a>
                </p>
              </template>

              <p class="mt-2 text-sm italic text-center" v-if="!timer.hasBeenActivated()">Starts wen focussing on any input</p>

              <p class="my-8 text-3xl text-center" v-if="showConcludingMessage">{{ concludingMessage }}</p>

              <!-- Username input and leaderboard -->
              <!-- <div v-if="true" class="max-w-sm mx-auto mt-4"> -->
              <div v-if="hasPlayedGame && inputDeclaredValid && !isScoreSubmitted" class="max-w-sm mx-auto mt-4">
                <div class="flex items-center px-4 py-2 mx-auto mt-4 bg-white rounded-lg">
                  <span class="text-gray-500">x.com/</span>
                  <!-- :disabled="isUsernameDisabled" -->
                  <input
                    v-model="username"
                    :disabled="isUsernameDisabled"
                    placeholder="Enter your X username"
                    class="flex-grow px-2 text-indigo-600 bg-white focus:outline-none"
                  />
                </div>
                <button
                  @click="submitScore"
                  class="flex items-center justify-center px-4 py-2 mx-auto mt-4 text-indigo-600 bg-white border-indigo-600 rounded-lg hover:bg-teal-50"
                >
                  <svg
                    v-if="isLoadingSubmission"
                    class="w-4 h-4 text-indigo-700 mr-1.5"
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                  >
                    <path fill="currentColor" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25" />
                    <path
                      fill="currentColor"
                      d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z"
                    >
                      <animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12" />
                    </path>
                  </svg>
                  {{ isLoadingSubmission ? 'Submitting' : 'Submit' }} Score →
                </button>
              </div>

              <!-- LEADERBOARD -->
              <div v-if="hasPlayedGame && leaderboard?.length" class="mt-4">
                <h2 class="mb-4 text-3xl text-center">Leaderboard</h2>
                <div class="flex justify-center mb-2">
                  <button
                    @click="currentLeaderboardMode = 'full'"
                    :class="currentLeaderboardMode === 'full' ? 'bg-indigo-500' : 'bg-indigo-700'"
                    class="px-4 py-2 text-white rounded-l-lg hover:bg-indigo-500"
                  >
                    Full form
                  </button>
                  <button
                    @click="currentLeaderboardMode = 'card'"
                    :class="currentLeaderboardMode === 'card' ? 'bg-indigo-500' : 'bg-indigo-700'"
                    class="px-4 py-2 text-white rounded-r-lg hover:bg-indigo-500"
                  >
                    Card only
                  </button>
                </div>
                <table class="w-11/12 mx-auto mt-6 text-indigo-800 bg-white rounded-lg">
                  <thead>
                    <tr>
                      <th class="px-4 py-2 border-b">Rank</th>
                      <th class="px-4 py-2 border-b">Username</th>
                      <th class="px-4 py-2 border-b">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(entry, index) in filteredLeaderboard" :key="entry.id" class="text-center">
                      <td :class="index === filteredLeaderboard.length - 1 ? ' border-b-0' : 'border-b'" class="px-4 py-2">{{ index + 1 }}</td>
                      <td :class="index === filteredLeaderboard.length - 1 ? ' border-b-0' : 'border-b'" class="px-4 py-2">
                        <div class="flex items-center justify-start py-1 ml-8">
                          <!-- <img :src="'https://twivatar.glitch.com/' + entry.username" alt="Avatar" class="mr-2 rounded-full w-7 h-7" /> -->
                          <svg class="mr-2 size-4" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                            <path
                              fill="#888888"
                              d="M8 2H1l8.26 11.015L1.45 22H4.1l6.388-7.349L16 22h7l-8.608-11.478L21.8 2h-2.65l-5.986 6.886zm9 18L5 4h2l12 16z"
                            />
                          </svg>
                          <a :href="'https://twitter.com/' + entry.username" target="_blank" class="hover:underline">@{{ entry.username }}</a>
                        </div>
                      </td>
                      <td :class="index === filteredLeaderboard.length - 1 ? ' border-b-0' : 'border-b'" class="px-4 py-2">
                        {{ entry.time.toFixed(3) }}s
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <button @click="restartGame()" v-if="hasPlayedGame" class="flex px-4 py-2 mx-auto mt-4 text-indigo-600 bg-white rounded-lg">
                Play again
              </button>
            </template>
          </div>

          <div class="mt-32 text-sm text-center lg:mt-0">
            <p>
              Made by <a href="https://x.com/erwin_ai" target="_blank" class="underline cursor-pointer hover:text-gray-200">@Erwin_AI</a>. I got
              inspired after having to enter these details four hundred trillion times. May the 4 be with you 2!
            </p>
          </div>
        </div>
      </div>

      <div class="lg:w-[60%] bg-gray-100">
        <div class="w-full max-w-xl mx-auto my-16 rounded-lg">
          <div class="flex flex-col space-y-1.5 p-6">
            <h3 class="text-2xl font-semibold leading-none tracking-tight whitespace-nowrap">Pay with card</h3>
          </div>
          <div class="p-6 space-y-4">
            <div v-if="!isGameModeCard" class="space-y-2">
              <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="email">Email</label>

              <input
                @focusin="startGame()"
                :disabled="disableInputs"
                v-model="inputEmail"
                class="flex h-10 w-full max-w-lg rounded-md border px-3 py-2 bg-white text-sm text-[#1a1a1ae6] leading-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="email"
                placeholder="imightspamyoul8ter@justkiddingiwont.com"
                type="email"
                autocorrect="off"
                spellcheck="false"
                data-1p-ignore="true"
              />

              <p v-if="inputEmailInvalid" class="text-xs italic text-red-500 grow">{{ inputEmailInvalid }}</p>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Card information</label>
              <div class="relative w-full bg-white">
                <div class="relative">
                  <span class="relative block w-full p-0 m-0">
                    <input
                      :disabled="disableInputs"
                      @input="limitCardNumberLength"
                      @focusin="startGame()"
                      v-model="inputCardNumber"
                      class="flex h-10 w-full max-w-lg rounded-md border px-3 py-2 text-sm text-[#1a1a1ae6] leading-normal relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      autocorrect="off"
                      spellcheck="false"
                      id="cardNumber"
                      name="cardNumber"
                      type="text"
                      inputmode="numeric"
                      placeholder="1234 1234 1234 1234"
                      aria-describedby=""
                      data-1p-ignore="false"
                    />
                  </span>
                </div>
                <div class="flex items-center pointer-events-none absolute right-0 top-0 h-full pr-2 z-[3]" style="opacity: 1">
                  <CardIcon src="/visa.svg" alt="Visa" />
                  <CardIcon src="/mastercard.svg" alt="MasterCard" />
                  <CardIcon src="/amex.svg" alt="American Express" />

                  <div class="relative flex items-center h-4 w-7">
                    <CardIcon src="/unionpay.svg" alt="UnionPay" :secondaryCard="true" />
                    <CardIcon src="/jcb.svg" alt="JCB" :secondaryCard="true" />
                    <CardIcon src="/discover.svg" alt="Discover" :secondaryCard="true" />
                    <CardIcon src="/diners.svg" alt="Diners Club" :secondaryCard="true" />
                  </div>
                </div>
              </div>
              <p v-if="inputCardNumberInvalid" class="text-xs italic text-red-500 grow">{{ inputCardNumberInvalid }}</p>
              <div class="grid grid-cols-2 items-center gap-x-[2px]">
                <input
                  @focusin="startGame()"
                  :disabled="disableInputs"
                  v-model="inputExpiry"
                  class="flex h-10 w-full rounded-md border px-3 py-2 bg-white text-sm text-[#1a1a1ae6] leading-normal focus-visible:z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-r-none"
                  id="expiry"
                  placeholder="MM / JJ"
                  @input="onInput"
                  @keydown="onKeydown"
                />
                <input
                  @focusin="startGame()"
                  :disabled="disableInputs"
                  v-model="inputCvc"
                  class="flex h-10 w-full rounded-md border px-3 py-2 bg-white text-sm text-[#1a1a1ae6] leading-normal focus-visible:z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-l-none"
                  id="cvc"
                  placeholder="CVC"
                />
              </div>
              <p v-if="inputExpiryInvalid" class="text-xs italic text-red-500 grow">{{ inputExpiryInvalid }}</p>
              <p v-if="inputCvcInvalid" class="text-xs italic text-red-500 grow">{{ inputCvcInvalid }}</p>
            </div>
            <div v-if="!isGameModeCard" class="space-y-2">
              <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="cardholder-name"
                >Cardholder name</label
              >
              <input
                @focusin="startGame()"
                :disabled="disableInputs"
                v-model="inputName"
                class="flex h-10 w-full rounded-md border px-3 py-2 bg-white text-sm text-[#1a1a1ae6] leading-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                id="cardholder-name"
                placeholder="Full name"
                autocorrect="off"
                spellcheck="false"
                data-1p-ignore="true"
              />
            </div>
            <div v-if="!isGameModeCard" class="space-y-2">
              <div class="flex justify-between">
                <label for="billing-address-fieldset">
                  <span class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Billing address</span>
                </label>
              </div>
              <fieldset class="p-0 my-1 ml-0 mr-0 border-none" id="billing-address-fieldset">
                <div class="relative flex flex-wrap">
                  <div class="flex-initial w-full max-w-full">
                    <div class="relative">
                      <select
                        @focusin="startGame()"
                        :disabled="disableInputs"
                        v-model="inputCountry"
                        id="billingCountry"
                        name="billingCountry"
                        aria-label="Country"
                        autocorrect="off"
                        class="appearance-none flex h-10 w-full rounded-t-md border px-3 py-2 text-sm text-[#1a1a1ae6] leading-normal focus-visible:z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <CountrySelectorOptions />
                      </select>
                      <svg
                        class="h-3 mt-[calc(12px*-.5)] pointer-events-none absolute right-[12px] top-1/2 w-3 z-[3]"
                        focusable="false"
                        viewBox="0 0 12 12"
                      >
                        <path
                          d="M10.193 3.97a.75.75 0 0 1 1.062 1.062L6.53 9.756a.75.75 0 0 1-1.06 0L.745 5.032A.75.75 0 0 1 1.807 3.97L6 8.163l4.193-4.193z"
                          fill-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <div class="flex-initial w-full max-w-full min-w-0">
                    <div class="relative">
                      <span class="block mt-[2px] relative w-full">
                        <input
                          @focusin="startGame()"
                          :disabled="disableInputs"
                          v-model="inputAddressOne"
                          class="flex h-10 w-full rounded-none border px-3 py-2 bg-white text-sm text-[#1a1a1ae6] leading-normal focus-visible:z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                          autocorrect="off"
                          spellcheck="false"
                          id="billingAddressLine1"
                          name="billingAddressLine1"
                          type="text"
                          aria-label="Address line 1"
                          placeholder="Address line 1"
                          data-1p-ignore="true"
                        />
                      </span>
                    </div>
                  </div>
                  <div class="flex-initial w-full max-w-full min-w-0">
                    <div class="relative">
                      <span class="block mt-[2px] relative w-full">
                        <input
                          @focusin="startGame()"
                          :disabled="disableInputs"
                          v-model="inputAddressTwo"
                          class="appearance-none flex h-10 w-full rounded-none border px-3 py-2 bg-white text-sm text-[#1a1a1ae6] leading-normal focus-visible:z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                          autocorrect="off"
                          spellcheck="false"
                          id="billingAddressLine2"
                          name="billingAddressLine2"
                          type="text"
                          aria-label="Address line 2"
                          placeholder="Address line 2"
                          data-1p-ignore="true"
                        />
                      </span>
                    </div>
                  </div>
                  <div class="flex-initial w-full max-w-full min-w-0">
                    <div class="relative">
                      <span class="block mt-[2px] relative w-full">
                        <input
                          @focusin="startGame()"
                          :disabled="disableInputs"
                          v-model="inputCity"
                          class="appearance-none flex h-10 w-full rounded-none border px-3 py-2 bg-white text-sm text-[#1a1a1ae6] leading-normal focus-visible:z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                          autocorrect="off"
                          spellcheck="false"
                          id="billingCity"
                          name="billingCity"
                          type="text"
                          aria-label="City"
                          placeholder="City"
                          data-1p-ignore="true"
                        />
                      </span>
                    </div>
                  </div>
                  <div class="flex-initial w-full max-w-full min-w-0">
                    <div class="relative">
                      <span class="block mt-[2px] relative w-full">
                        <input
                          @focusin="startGame()"
                          :disabled="disableInputs"
                          v-model="inputZipCode"
                          class="appearance-none flex h-10 w-full rounded-b-md border px-3 py-2 bg-white text-sm text-[#1a1a1ae6] leading-normal focus-visible:z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                          autocorrect="off"
                          spellcheck="false"
                          id="billingZipCode"
                          name="billingZipCode"
                          type="text"
                          aria-label="Zipcode"
                          placeholder="Zipcode"
                          data-1p-ignore="true"
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
          <div class="flex items-center px-6 pt-6 pb-2">
            <button
              :disabled="disableInputs"
              @click="stopGame()"
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 px-4 py-2 ml-auto w-full bg-[#0A2540] text-white"
            >
              Pay (ends timer)
            </button>
          </div>
          <p class="pb-6 text-xs italic text-center underline">Reminder: this is a game, not a real checkout form. You will not be billed.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
