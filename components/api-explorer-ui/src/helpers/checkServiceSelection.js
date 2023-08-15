export default async function checkServiceSelection ($vueAuth) {
  const oauthEnabled = $vueAuth?.loggedIn?.value
  if (oauthEnabled) {
    const userInfo = await this.$vueAuth.userInfo()
    return {
      name: 'Board Games API',
      service: 'OAuth',
      message: `🔑 Logged in as ${userInfo?.email} using Connected Web Auth.`,
      authed: true
    }
  }

  return {
    name: 'No Service',
    service: 'None',
    message: '🔒 No credentials available; please login!',
    authed: false
  }
}
