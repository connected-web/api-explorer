<template>
  <div class="user-details">
    <h1>User Details</h1>

    <div v-if="loggedIn">
      <p>Information about you!</p>

      <StatValue label="Name" style="text-transform: capitalize;">{{ userName }}</StatValue>
      <StatValue label="Initials">{{ (userInitials + '').toUpperCase() }}</StatValue>
      <StatValue label="Email Address">{{ userInfo?.email }}</StatValue>
      <StatValue label="Logged in for"><RelativeDate v-if="$vueAuth.expiryTime?.value" :date="$vueAuth.expiryTime?.value" /></StatValue>
      <StatValue label="Access expiry">{{ $vueAuth.expiryTime.value }}</StatValue>
      <StatValue label="Groups">{{ userGroups.join(', ') }}</StatValue>
      
      <pre v-if="false"><code>{{ $vueAuth.decodedIdToken?.value }}</code></pre>
      
      <div class="row right">
        <button @click="logout">
          <span>Logout</span>
          <Icon icon="sign-out-alt" />
        </button>
      </div>
    </div>

    <div v-else>
      <p>You are not logged in!</p>
      <p>You could be anyone... that doesn't stop you from browsing the available API documentation - but you won't be able to interact with them!</p>
      <p>Have fun :)</p>
    </div>
  </div>
</template>

<script>
import Collapsed from '../components/Collapsed.vue'
import RelativeDate from '../components/RelativeDate.vue'
import StatValue from '../components/StatValue.vue'

export default {
  components: { Collapsed, RelativeDate, StatValue },
  data() {
    return { 
      userInfo: null,
      replacementRefreshToken: '',
      replacementBearerToken: '',
      replacementExpiryTime: (new Date()).toISOString()
    }
  },
  computed: {
    loggedIn() {
      return this.$vueAuth.loggedIn.value
    },
    localStorage() {
      return window.localStorage
    },
    userName() {
      const userInfo = this.$vueAuth?.decodedIdToken?.value
      if (userInfo) {
        const { name, email } = userInfo
        if (name) {
          return name
        }
        if (email) {
          const nameFromEmail = email.split('@')[0].split('.').join(' ')
          return nameFromEmail
        }
      } 
      return ''
    },
    userInitials() {
      const { userName } = this
      const words = userName.split(' ')
      const first = words[0] ?? 'N'
      const last = words.pop() ?? 'A'
      return first.charAt(0) + last.charAt(0)
    },
    userGroups() {
      return this.$vueAuth.decodedIdToken?.value?.['cognito:groups'] ?? ['New member!']
    }
  },
  mounted() {
    if (this.loggedIn) {
      this.fetchUserInfo()
    }
  },
  methods: {
    async fetchUserInfo() {
      this.userInfo = await this.$vueAuth.userInfo()
    },
    async logout() {
      await this.$vueAuth.logout(null, true)
    }
  },
  watch: {
    async loggedIn(newVal) {
      if (newVal) {
        this.fetchUserInfo()
      }
    }
  }
}
</script>

<style scoped>
.row {
  margin: 0.5em 0;
}

input {
  width: 100%;
  padding: 0.5em;
}
</style>