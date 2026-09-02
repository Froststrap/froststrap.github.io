<script lang="ts">
	import './layout.css';

	let { children } = $props();
	import Header from '#lib/Header.svelte'
	import Footer from '#lib/Footer.svelte'
</script>

<svelte:head><link rel="icon" href="/favicon.png" /></svelte:head>
<Header/>
<main>
{@render children()}
</main>
<Footer/>
