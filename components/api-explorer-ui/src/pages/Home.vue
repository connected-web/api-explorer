<template>
  <div class="home page">
    <h1>Home</h1>
    <p>Welcome to the Connected Web API Explorer!</p>

    <h2>About</h2>
    <p>This is an API Explorer for Connected Web services hosted on <b>connected-web.net</b> and <b>connected-web.services</b>.</p>

    <h2>Source code</h2>
    <ul>
      <li><Icon icon="code-branch" /> <a href="https://github.com/connected-web/api-explorer">connected-web/api-explorer &rarr;</a></li>
    </ul>

    <h2>Roadmap</h2>

    <h3>✔️ 2023 September</h3>
    <p>
      <StatValue label="Code reflection on JavaScript / TypeScript Classes">✔️</StatValue>
      <StatValue label="Add Board Games API Open API Spec">✔️</StatValue>
      <StatValue label="Add Schema API DB Open API Spec">✔️</StatValue>
      <StatValue label="Generate API Explorer based on Open API Specs">✔️</StatValue>
    </p>
    
    <h3>✔️ 2023 August</h3>
    <p>
      <StatValue label="Setup public website hosted on Github Pages">✔️</StatValue>
    </p>

    <h3>🚧 In development</h3>
    <p>
      <StatValue label="Use litegraph.js to create visual applications">🚧</StatValue>
      <StatValue label="Support Open API nodes via code reflection">🚧</StatValue>
      <StatValue label="Support JSON Input / Viewer nodes">🚧</StatValue>
    </p>

    <h3>💡 Future Ideas</h3>
    <p>
      <StatValue label="Build more APIs">💡</StatValue>
      <StatValue label="Setup service discovery and status endpoints">💡</StatValue>
      <StatValue label="Generate site dynamically based on service discovery">💡</StatValue>
      <StatValue label="Add descriptions to fields from Open API spec">💡</StatValue>
      <StatValue label="Add descriptions to endpoints from Open API spec">💡</StatValue>
      <StatValue label="Support complex schema objects and validation for payloads">💡</StatValue>
    </p>

    <h3><Icon icon="envelopes-bulk" />API Ideas</h3>
    <p>
      <StatValue label="User profile management API">💡</StatValue>
      <StatValue label="User group management API">💡</StatValue>
      <StatValue label="Usage and metrics API">💡</StatValue>
      <StatValue label="Billing and Account API">💡</StatValue>
    </p>

    <p class="key" v-if="false">
      <StatValue label="Idea">💡</StatValue>
      <StatValue label="Complete">✔️</StatValue>
      <StatValue label="Work in progress">🚧</StatValue>
      <StatValue label="Incomplete">❌</StatValue>
    </p>
    
    <div style="text-align: center; filter: drop-shadow(15px 7px 7px rgb(0 0 0 / 0.3)); margin-top: 4em;">
      <img src="/site.svg" style="width: 100%; max-width: 320px;" />
    </div>
  </div>
</template>

<script>
import StatValue from '../components/StatValue.vue'
export default {
  components: { StatValue }
}
</script>