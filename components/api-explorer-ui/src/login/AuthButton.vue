<template>
  <div :class="{ 'auth-status': true, 'logged-in': loggedIn }">
    <router-link v-if="loggedIn" to="/user/details" class="row center p5">
      <label class="user-name">{{ userName }}</label>
      <label class="user-initials">{{ userInitials }}</label>
      <div class="circle-icon" title="View User Details">
        <Icon :icon="loggedIn ? 'user-shield' : 'user-slash'" />
      </div>
    </router-link>
    <button v-else @click="authorize" class="sso-login">
      <span>Login</span>
      <div class="circle-icon" title="View User Details">
        <Icon :icon="loggedIn ? 'user-shield' : 'user-slash'" />
      </div>
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return { 
      userInfo: null
    }
  },
  computed: {
    loggedIn() {
      return this.$vueAuth?.loggedIn?.value
    },
    initialized() {
      return Boolean(this.$vueAuth?.initialized)
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
    }
  },
  methods: {
    async authorize(ev) {
      await this.$vueAuth.authorize()
    }
  },
  watch: {
    async loggedIn(newVal) {
      this.$forceUpdate()
    }
  }
}
</script>

<style scoped>
div.auth-status {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;
}
div.auth-status a {
  color: #000000;
}
div.auth-status.logged-in a {
  color: white;
}

a label.user-name {
  text-transform: capitalize;
  font-weight: 600;
  width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-align: right;
  color: black;
}
a:hover label.user-name {
  color: rgb(34, 34, 34);
}
label.user-initials {
  display: none;
  text-transform: uppercase;
  font-weight: 600;
  color: black;
}
div.auth-status button {
  text-transform: uppercase;
  letter-spacing: 2px;
  white-space: nowrap;
  font-size: 12px;
}
div.auth-status:hover button {
  background: #85d;
}

@media (max-width: 1279px) {
  label.user-name {
    display: none;
  }
  label.user-initials {
    display: block;
  }
}

@media only screen and (max-width: 640px) {
  button > span {
    display: none;
  }
}
</style>