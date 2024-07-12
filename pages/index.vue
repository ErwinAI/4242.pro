<script setup>
import { Profanity, ProfanityOptions } from '@2toad/profanity'
import { EmailValidator, CVCValidator, ExpiryDateValidator, CreditCardValidator } from 'assets/js/validators.js'
import JSConfetti from 'js-confetti'

const { $csrfFetch } = useNuxtApp()
const config = useRuntimeConfig();
const siteKey = config.public.turnstileSiteKey;

useHead({
  meta: [
    { property: 'og:image', content: '/metaog.png' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: '4242.pro' },
    { property: 'twitter:card', content: 'summary_large_image' },
  ],
  script: [
    {
      src: 'https://challenges.cloudflare.com/turnstile/v0/api.js',
      async: true,
      defer: true,
    },
  ]
})

// check if browser
if (process.client) {
  console.log(`

██╗  ██╗██████╗ ██╗  ██╗██████╗
██║  ██║╚════██╗██║  ██║╚════██╗
███████║ █████╔╝███████║ █████╔╝
╚════██║██╔═══╝ ╚════██║██╔═══╝
     ██║███████╗     ██║███████╗
     ╚═╝╚══════╝     ╚═╝╚══════╝

██████╗ ██████╗  ██████╗
██╔══██╗██╔══██╗██╔═══██╗
██████╔╝██████╔╝██║   ██║
██╔═══╝ ██╔══██╗██║   ██║
██║     ██║  ██║╚██████╔╝
╚═╝     ╚═╝  ╚═╝ ╚═════╝

Welcome. You must be opening this to check how 4242.pro works or you're trying to cheat our game.
We say: nah m8. Good try. Goodbye. 👋
  `)
}

// Initialize Profanity filter
const options = new ProfanityOptions()
options.wholeWord = false // set false to catch partial matches
const profanity = new Profanity(options)

// Add custom words to the profanity filter
profanity.addWords(['paddle'])

const isBrowser = typeof window !== 'undefined'
const username = ref(isBrowser ? localStorage.getItem('username') || '' : '')
const isUsernameSubmitted = ref(isBrowser ? JSON.parse(localStorage.getItem('isUsernameSubmitted')) || false : false) // Load from localStorage
const isUsernameDisabled = computed(() => isUsernameSubmitted.value) // Update computed property
const leaderboard = ref([])
const userRank = ref(null)
const isLoadingLeaderboard = ref(false)
const hasImprovedScoreMessage = ref('')
const lastScore = ref('')

// computed share url
const shareUrl = computed(() => {
  return `https://4242.pro/c/${lastScore.value.$id}`
})

const currentLeaderboardMode = ref('full')

const filteredLeaderboard = computed(() => {
  return leaderboard.value.filter((entry) => {
    return entry.mode === currentLeaderboardMode.value
  })
})

// watch currentLeaderboardMode, check if game mode changed, and fetch leaderboard again
watch(currentLeaderboardMode, async (newValue) => {
  if (newValue && hasPlayedGame.value) {
    isLoadingLeaderboard.value = true
    await fetchLeaderboardAndRank(username.value, newValue)
  }
})

const fetchLeaderboardAndRank = async (username, mode) => {
  try {
    isLoadingLeaderboard.value = true

    try {
      const callResult = await useCsrfFetch('/api/leaderboard')
      leaderboard.value = callResult.data.value;
    } catch (e) {
      console.error('Error fetching leaderboard:', e)
      leaderboard.value = []
      throw new Error('Error fetching leaderboard')
    }

    try {
      const rankData = await useCsrfFetch(`/api/rank?username=${username}&mode=${mode}`)
      userRank.value = rankData.data.value.rank
      if (userRank.value <= 3) {
        const jsConfetti = new JSConfetti()
        setTimeout(() => {
          jsConfetti.addConfetti({
            emojis: userRank.value === 1 ? ['🥇'] : userRank.value === 2 ? ['🥈'] : ['🥉'],
          })
          jsConfetti.addConfetti({
            emojis: userRank.value === 1 ? ['🥇'] : userRank.value === 2 ? ['🥈'] : ['🥉'],
          })
        }, 2000)
      }
    } catch (e) {
      console.error('Error fetching user rank:', e)
      userRank.value = null
      throw new Error('Error fetching user rank')
    }
  } catch (err) {
    console.error('Unexpected error fetching leaderboard and rank:', err)
    leaderboard.value = []
    userRank.value = null
    alert('Error fetching leaderboard and rank, please try again later pal 😬 We are not getting paid enough (at all) for this. Bear with us ✌️')
  } finally {
    isScoreSubmitted.value = true
    isLoadingSubmission.value = false
    isLoadingLeaderboard.value = false
  }
}

const isScoreSubmitted = ref(false)
const isLoadingSubmission = ref(false)

const submitScore = async () => {
  if (!username.value) return
  isLoadingSubmission.value = true
  isLoadingLeaderboard.value = true
  const jsConfetti = new JSConfetti()
  const newEntry = {
    username: username.value,
    time: timer.value.getTime(),
    mode: gameMode.value,
    turnstileToken: turnstile.getResponse(),
  }

  try {
    const callResult = await $csrfFetch('/api/leaderboard', {
      method: 'POST',
      body: newEntry,
    })

    lastScore.value = callResult

    if (callResult.warning) {
      hasImprovedScoreMessage.value = 'One of your previous scores was better lol sry'
    } else if (callResult.robot) {
      hasImprovedScoreMessage.value = 'You are a robot, you cannot submit scores. 🤖'
    }else {

      // Check if the username already exists in the leaderboard for the current game mode
      const existingEntryIndex = leaderboard.value.findIndex((entry) => entry.username === username.value && entry.mode === gameMode.value)

      if (existingEntryIndex !== -1) {
        // Update the existing entry
        leaderboard.value[existingEntryIndex] = callResult
      } else {
        // Add a new entry
        leaderboard.value.push(callResult)
      }

      leaderboard.value.sort((a, b) => a.time - b.time)

      localStorage.setItem('username', username.value) // Store username in localStorage
      isUsernameSubmitted.value = true // Set to true after successful submission
      localStorage.setItem('isUsernameSubmitted', JSON.stringify(true)) // Persist state in localStorage
    }

    await jsConfetti.addConfetti({
      emojis: ['💳', '💰', '💰', '💸', '💵', '💶', '💷', '💳'],
    })
    setTimeout(() => {
      jsConfetti.addConfetti({
        emojis: ['💳', '💰', '💰', '💸', '💵', '💶', '💷', '💳'],
      })
    }, 500)
    await fetchLeaderboardAndRank(username.value, gameMode.value)
  } catch (e) {
    console.error('Error submitting score:', e)
    isLoadingSubmission.value = false
    alert('Error submitting your score, please try again later pal 😬 We are not getting paid enough (at all) for this. Bear with us ✌️')
  }
}

const timer = ref()
const concludingMessage = ref('GOGoGOGO11!1!! Ur product manager and a senior engineer are already judging you.')
const showConcludingMessage = ref(false)
const hasAcceptedTerms = ref(false)
const hasPlayedGame = ref(false)
const gameMode = ref('full')
const hasCopiedShareLink = ref(false)
const openedDevTools = ref(false)

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

const isGameRunning = computed(() => timer.value?.isRunning() || false)

/*
TODO:
 - Build overview of favorite indie hackers, products, and tools
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

onMounted(() => {
  const cardIcons = document.querySelectorAll('.card-icon');
  let currentIndex = 0;

  function showNextIcon() {
    if (cardIcons.length === 0) return; // Ensure there are icons
    cardIcons[currentIndex].classList.remove('opacity-100', 'scale-100');
    cardIcons[currentIndex].classList.add('opacity-0', 'scale-[0.9]');

    currentIndex = (currentIndex + 1) % cardIcons.length;

    cardIcons[currentIndex].classList.remove('opacity-0', 'scale-[0.9]');
    cardIcons[currentIndex].classList.add('opacity-100', 'scale-100');
  }

  setInterval(showNextIcon, 2000);

  // Watch whether hasAcceptedTerms goes to true
  watch(hasAcceptedTerms, (value) => {
    if (value) {
      timer.value = new Timer();
    }
  });

  // Watch for changes in the username input
  watch(username, (newValue) => {
    // Remove spaces
    username.value = newValue.replace(/\s/g, '');

    // Check for profanity
    if (profanity.exists(username.value)) {
      alert('Please avoid using inappropriate words in your username.');
      username.value = '';
    }
  });

  // Ensure the DOM is fully rendered
  requestAnimationFrame(() => {

    // Periodically check for the devtoolsDetector
    const checkDevtoolsDetector = () => {
      if (typeof devtoolsDetector !== 'undefined') {
        if (devtoolsDetector.isOpen) {
          openedDevTools.value = true;
        }

        devtoolsDetector.config.onDetectOpen = () => {
          openedDevTools.value = true;
        };
        devtoolsDetector.config.onDetectClose = () => {
          openedDevTools.value = false;
        };
      } else {
        setTimeout(checkDevtoolsDetector, 1000); // Retry after 1 second
      }
    };

    checkDevtoolsDetector();

    // To prevent pasting
    const disableCopyCutPaste = (event) => {
      event.preventDefault();
    };
    document.body.addEventListener('paste', disableCopyCutPaste);
  });
});

const startGame = () => {
  if (hasAcceptedTerms.value) {
    timer.value.start()
  }
}

const stopGame = (event) => {
  if (!event.isTrusted) {
    console.log('Synthetic event detected');
  } else {
    hasPlayedGame.value = true
    timer.value.stop()

    validateResults()
  }
}

const copyShareLink = async () => {
  // put url in clipboard
  hasCopiedShareLink.value = true
  await navigator.clipboard.writeText(shareUrl.value)
  setTimeout(() => {
    hasCopiedShareLink.value = false
  }, 2000)
}

const generateTwitterShareLink = () => {
  const time = lastScore.value ? lastScore.value.time.toFixed(4) : null

  // generate twitter share link
  return `https://twitter.com/intent/tweet?text=Just filled in the @stripe checkout form${time ? ' in ' + time + ' seconds' : ''}! U think u better dev? Beat my score ;)?&url=${shareUrl.value}&hashtags=4242pro`
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

  userRank.value = null
  leaderboard.value = []

  hasImprovedScoreMessage.value = ''
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
    inputCardNumberInvalid.value = "That's not a valid card lawl rekt"
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
      concludingMessage.value = "HMMMMMRRR! Ur blazin' there wow but can you like, try harder?! I want you to see the other messages lol"
    } else if ((isGameModeFull.value && timer.value.getTime() < 16) || (isGameModeCard.value && timer.value.getTime() < 6)) {
      concludingMessage.value = "Sick score but don't share this because your friends might unfollow you, you can do better!"
    } else if ((isGameModeFull.value && timer.value.getTime() < 19) || (isGameModeCard.value && timer.value.getTime() < 7)) {
      concludingMessage.value = 'Pretty fast. Did you grease up your keyboard before attempting this round?'
    } else if ((isGameModeFull.value && timer.value.getTime() < 22) || (isGameModeCard.value && timer.value.getTime() < 8)) {
      concludingMessage.value = 'Eh oke nice I guess haha but try harder okay?'
    } else if ((isGameModeFull.value && timer.value.getTime() < 25) || (isGameModeCard.value && timer.value.getTime() < 10)) {
      concludingMessage.value = "This is average what were you doing? Can't afford typos okay try again."
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
    <!--<div class="absolute z-50 w-full h-screen py-32 font-mono text-white bg-indigo-400 lg:hidden">
      <p class="mt-8 text-4xl text-center lg:mt-16">4242.pro</p>
      <p class="mx-4 my-4 text-lg text-center text-white">Sry but u can only play on big screen lol 🫠 cant rly play with touch keyboard etc.</p>
      <p class="mx-4 my-6 text-lg text-center text-white">But we promise if u get ur on ur desktop/laptop it's gonna be worth it haha 🤞</p>
    </div>-->

    <div
      v-if="openedDevTools"
      class="absolute z-50 flex flex-col items-center justify-center w-full h-screen py-32 font-mono text-white bg-indigo-400"
    >
      <p class="mb-8 text-4xl text-center">4242.pro</p>
      <p class="mb-2 text-lg font-bold text-center">Haha r u serious?! You opened the devtools, are you trying to cheat? 👀</p>
      <p class="text-lg font-bold text-center">Hell naw m8 we don't allow this. Close the devtools to continue playing the game 😜</p>
    </div>

    <template v-else>
      <div v-if="username" class="absolute top-3 left-3 border-2 border-white/50 rounded-full px-1.5 py-0.5 text-xs text-white font-mono">
        @{{ username }}
      </div>
      <div class="flex flex-col h-full lg:flex-row">
        <div class="lg:w-[40%] flex bg-indigo-600 font-mono text-white p-4">
          <div class="flex flex-col justify-between grow">
            <div class="w-full grow">
              <h1 class="mt-8 font-mono text-4xl text-center lg:mt-16">4242.pro</h1>
              <p class="mx-4 my-3 text-lg text-center text-indigo-100">Let's see if ur a real 10x engineer or a n00b 👀</p>
              <div class="w-full h-[2px] mt-6 bg-indigo-500"></div>
              <div class="w-9/12 mx-auto mt-16 text-left" v-if="!hasPlayedGame">
                <p class="mb-2 text-lg font-bold">🎯 Your Goal</p>
                <p>Fill out the right checkout form <span class="font-bold">asap</span> 👉</p>
              </div>

              <!-- BEFORE GAME / ACCEPTING TERMS -->
              <template v-if="!hasAcceptedTerms">
                <div class="mt-28">
                  <button
                    @click="hasAcceptedTerms = true"
                    class="flex px-4 py-2 mx-auto mt-4 text-indigo-600 bg-white rounded-lg scale-[1.15] hover:scale-[1.16] transition-transform hover:bg-teal-50"
                  >
                    Let's start the game m8 →
                  </button>
                  <p class="w-11/12 mx-auto mt-8 mb-2 text-xs italic text-center text-indigo-200">
                    By clicking the start button you confirm that you understand this is a <strong>GAME</strong> and <strong>NOT REAL</strong>. Again
                    it's <strong>NOT REAL</strong>. If you enter your real CC details, perhaps we will charge you! Don't gamble, be warned. Okay now
                    that you have read this, click the button above and show us ur sk1lz.
                  </p>
                </div>
              </template>

              <!-- CURRENT STATE OR OUTCOME OF GAME -->
              <template v-else>
                <template v-if="!timer.hasBeenActivated() || timer.isRunning() || (timer.hasStopped() && inputDeclaredValid)">
                  <p class="mt-8 text-center lg:mt-16">
                    <span class="text-4xl" :class="hasPlayedGame ? 'font-bold' : ''"> {{ timer ? timer.getTime().toFixed(4) : '' }}</span
                    ><span class="text-2xl"> seconds</span>
                  </p>
                  <p class="mt-4 text-base text-center" v-if="hasImprovedScoreMessage && hasImprovedScoreMessage !== ''">
                    {{ hasImprovedScoreMessage }}
                  </p>
                </template>
                <p class="flex items-center justify-center mt-2 text-sm italic text-center text-indigo-300" v-if="!timer.hasBeenActivated()">
                  <SvgCircleNotification />
                  Starts wen focussing on any input
                </p>
                <p class="mx-3 mt-12 mb-16 text-2xl italic text-center text-indigo-100" v-if="showConcludingMessage">"{{ concludingMessage }}"</p>

                <div class="contents" v-if="!isGameRunning">
                  <div class="flex items-center justify-center mx-auto mt-10 mb-5 font-bold text-center text-white">↓ Pick your game mode ↓</div>
                  <div class="grid max-w-sm grid-cols-2 mx-auto gap-x-2">
                    <div
                      class="flex items-center justify-center px-4 py-2 border-white cursor-pointer"
                      @click=";(gameMode = 'full'), (currentLeaderboardMode = 'full')"
                      :class="isGameModeFull ? 'border-2 text-white bg-indigo-700' : 'text-gray-400 hover:border-2'"
                    >
                      <SvgFullMode />
                      Full form
                    </div>

                    <div
                      class="flex items-center justify-center px-4 py-2 border-white cursor-pointer"
                      @click=";(gameMode = 'card'), (currentLeaderboardMode = 'card')"
                      :class="isGameModeCard ? 'border-2 text-white bg-indigo-700' : 'text-gray-400 hover:border-2'"
                    >
                      <SvgCardMode />
                      Card only
                    </div>
                  </div>
                </div>
                <button
                  @click="restartGame()"
                  v-if="hasPlayedGame"
                  class="flex px-4 mt-8 py-2 mx-auto text-indigo-600 bg-white rounded-lg scale-[1.15] hover:scale-[1.16] transition-transform hover:bg-teal-50"
                >
                  Play again →
                </button>
              </template>
            </div>

            <div class="w-full h-[2px] mb-4 bg-indigo-500"></div>
            <div class="px-2 py-4 text-xs text-center bg-indigo-800 rounded-md">
              <p>
                Made by <a href="https://x.com/erwin_ai" target="_blank" class="underline cursor-pointer hover:text-gray-200">@Erwin_AI</a> and
                <a href="https://x.com/sobedominik" target="_blank" class="underline cursor-pointer hover:text-gray-200">@sobedominik</a>, with help from <a href="https://x.com/martijnckx" target="_blank" class="underline cursor-pointer hover:text-gray-200">@martijnckx</a>. We got
                inspired after having to enter these details four hundred trillion times. May the 4 be with you 2!
              </p>
            </div>
          </div>
        </div>

        <div class="lg:w-[60%] bg-gray-100">
          <form v-if="!hasPlayedGame || (hasPlayedGame && !inputDeclaredValid)" @submit.prevent="stopGame">
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
                    autocomplete="off"
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
                          autocomplete="off"
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
                      autocorrect="off"
                      autocomplete="off"
                      @input="onInput"
                      @keydown="onKeydown"
                    />
                    <input
                      @focusin="startGame()"
                      :disabled="disableInputs"
                      v-model="inputCvc"
                      autocorrect="off"
                      autocomplete="off"
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
                    autocomplete="off"
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
                              autocomplete="off"
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
                              autocomplete="off"
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
                              autocomplete="off"
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
                              autocomplete="off"
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
              <div class="flex items-center px-6">
                <div class="cf-turnstile" data-theme="light" :data-sitekey="siteKey"></div>
              </div>
              <div class="flex items-center px-6 pt-6 pb-2">
                <button
                  :disabled="disableInputs"
                  type="submit"
                  class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 px-4 py-2 ml-auto w-full bg-[#0A2540] text-white"
                >
                  Pay (ends timer)
                </button>
              </div>
              <p class="pb-6 text-xs italic text-center underline">Reminder: this is a game, not a real checkout form. You will not be billed.</p>
            </div>
          </form>
          <div v-else>
            <!-- LEADERBOARD -->
            <div v-if="inputDeclaredValid && hasPlayedGame" class="flex flex-col items-center justify-center w-full h-screen">
              <h2 class="font-mono text-3xl text-center">🏆 Leaderboard</h2>
              <p class="mt-3 font-mono text-base text-center">The ultimate ranking of 10x engineers 😎</p>
              <div class="contents" v-if="!isScoreSubmitted">
                <div class="relative flex items-center justify-center h-[350px] w-10/12 mt-10">
                  <div class="z-10 text-lg font-bold">Submit your score to see if you're in the top 10x engineers 🫣</div>
                  <img src="@/assets/imgs/blurred_leaderboard.jpg" width="200" class="absolute w-full h-auto opacity-80" alt="" />
                </div>
                <div v-if="true" class="max-w-sm mx-auto mt-4 font-mono scale-110">
                  <div class="flex items-center px-5 py-3 mx-auto mt-4 bg-indigo-800 border-2 border-indigo-300 rounded-lg shadow-md">
                    <span class="text-indigo-200">x.com/</span>
                    <input
                      v-model="username"
                      :disabled="isUsernameDisabled"
                      placeholder="Enter your X username"
                      :class="isUsernameDisabled ? 'cursor-not-allowed opacity-30' : ''"
                      class="flex-grow px-2 font-medium text-white bg-indigo-800 focus:outline-none"
                    />
                  </div>
                  <button
                    @click="submitScore"
                    class="flex items-center justify-center scale-[1.15] hover:scale-[1.16] transition-transform px-4 py-2 mx-auto mt-6 font-semibold text-indigo-600 bg-white border-2 border-indigo-700 rounded-lg hover:bg-teal-50"
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
              </div>
              <div class="contents" v-if="isScoreSubmitted && leaderboard?.length && !isLoadingLeaderboard">
                <div class="flex justify-center mt-8 mb-2">
                  <button
                    @click="currentLeaderboardMode = 'full'"
                    :class="currentLeaderboardMode === 'full' ? 'bg-zinc-800' : 'bg-zinc-500'"
                    class="flex items-center justify-center px-4 py-2 text-white rounded-l-lg hover:bg-zinc-800"
                  >
                    <SvgFullMode />
                    Full form
                  </button>
                  <button
                    @click="currentLeaderboardMode = 'card'"
                    :class="currentLeaderboardMode === 'card' ? 'bg-zinc-800' : 'bg-zinc-500'"
                    class="flex items-center justify-center px-4 py-2 text-white rounded-r-lg hover:bg-zinc-800"
                  >
                    <SvgCardMode />
                    Card only
                  </button>
                </div>

                <!-- User rank display -->
                <div v-if="userRank !== null" class="mt-6 text-center">
                  <p>
                    You are currently ranking: <span class="text-indigo-600 text-semibold">{{ userRank }}</span>
                  </p>
                  <p v-if="userRank === 1">🎉 Congratulations! You are the top scorer! 🥇</p>
                  <p v-if="userRank === 2">🎉 Great job! You are the second top scorer! 🥈</p>
                  <p v-if="userRank === 3">🎉 Well done! You are the third top scorer! 🥉</p>
                </div>
                <div class="relative w-8/12 mx-auto mt-5 overflow-hidden bg-white rounded-lg shadow-lg text-zinc-800">
                  <table class="w-full table-fixed">
                    <thead class="sticky top-0 z-10 bg-white">
                      <tr>
                        <th class="px-4 py-2 border-b">Rank</th>
                        <th class="px-4 py-2 border-b">Username</th>
                        <th class="px-4 py-2 border-b">Time</th>
                      </tr>
                    </thead>
                  </table>
                  <div class="max-h-[400px] overflow-y-auto">
                    <table class="w-full table-fixed">
                      <tbody>
                        <tr
                          v-for="(entry, index) in filteredLeaderboard.slice(0, 30)"
                          :key="entry.id"
                          :class="[
                            entry.username === username ? 'bg-yellow-50' : '',
                            index < 3 ? ' text-indigo-600' : '',
                            index === 0 ? 'font-bold' : '',
                          ]"
                          class="text-center"
                        >
                          <td :class="index === filteredLeaderboard.length - 1 ? ' border-b-0' : 'border-b'" class="px-4 py-2">
                            <span v-if="index === 0">🥇</span>
                            <span v-if="index === 1">🥈</span>
                            <span v-if="index === 2">🥉</span>
                            {{ index + 1 }}
                          </td>
                          <td :class="index === filteredLeaderboard.length - 1 ? ' border-b-0' : 'border-b'" class="px-4 py-2">
                            <div class="flex items-center justify-start py-1 ml-0">
                              <svg class="mr-2 size-4 shrink-0" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                                <path
                                  fill="#888888"
                                  d="M8 2H1l8.26 11.015L1.45 22H4.1l6.388-7.349L16 22h7l-8.608-11.478L21.8 2h-2.65l-5.986 6.886zm9 18L5 4h2l12 16z"
                                />
                              </svg>
                              <a :href="'https://x.com/' + entry.username" target="_blank" class="hover:underline">@{{ entry.username }}</a>
                            </div>
                          </td>
                          <td :class="index === filteredLeaderboard.length - 1 ? ' border-b-0' : 'border-b'" class="px-4 py-2">
                            {{ entry.time.toFixed(4) }}s
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <template v-if="!timer.hasBeenActivated() || timer.isRunning() || (timer.hasStopped() && inputDeclaredValid)">

                  <div v-if="showConcludingMessage" class="flex flex-col items-center justify-center mt-4 gap-x-2">
                    <h3 class="mt-6 mb-1 font-mono text-xl font-medium">🌐 Share your score</h3>
                    <p class="mb-5 font-mono text-xs opacity-60">If you are brave enough</p>
                    <div class="flex gap-x-2">
                      <button
                        @click="copyShareLink()"
                        class="flex items-center h-8 px-4 py-2 text-xs bg-indigo-600 text-white rounded-full"
                      >
                        {{ hasCopiedShareLink ? 'Share URL copied ✅' : 'Copy share URL' }}
                      </button>
                      <a class="bg-black flex items-center h-8 px-4 py-2 text-xs text-white rounded-full"
                         :href="generateTwitterShareLink()" target="_blank">
                        <svg class="mr-2 size-4 inline text-white" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                          <path
                              fill="#888888"
                              d="M8 2H1l8.26 11.015L1.45 22H4.1l6.388-7.349L16 22h7l-8.608-11.478L21.8 2h-2.65l-5.986 6.886zm9 18L5 4h2l12 16z"
                          />
                        </svg>
                        Post my score
                      </a>
                    </div>
                  </div>
                </template>
              </div>
              <div v-if="isScoreSubmitted && isLoadingLeaderboard" class="flex flex-col items-center justify-center w-full h-screen">
                <div class="flex items-center justify-center scale-125">
                  <svg class="mr-2 text-black size-4" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="0" fill="currentColor">
                      <animate attributeName="r" calcMode="spline" dur="1.2s" keySplines=".52,.6,.25,.99" repeatCount="indefinite" values="0;11" />
                      <animate
                        attributeName="opacity"
                        calcMode="spline"
                        dur="1.2s"
                        keySplines=".52,.6,.25,.99"
                        repeatCount="indefinite"
                        values="1;0"
                      />
                    </circle>
                  </svg>
                  Fetching the 10x engineers leaderboard...
                </div>
                <div class="flex items-center justify-center mt-2 text-sm text-indigo-700">Ready to see how bad you are? 😉</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style>
div[data-lastpass-icon-root] {
  display: none;
}
div[data-lastpass-root] {
  display: none;
}
</style>
