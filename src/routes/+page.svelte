<script lang="ts">
	import {
		type Clothing,
		type Avatar,
		type Enemy,
		type Powerup,
		powerups,
		extraClothes,
		newInventory,
		calculateSynergyBoost
	} from '$lib/index';
	import enemy1 from '$lib/assets/enemy-draft1.jpg';
	import enemy2 from '$lib/assets/enemy-draft2.jpg';
	import enemy3 from '$lib/assets/enemy-draft3.jpg';
	import enemy5 from '$lib/assets/enemy-draft5.jpg';
	import enemy6 from '$lib/assets/enemy-draft6.jpg';

	import { slide } from 'svelte/transition';

	let avatar = $state<Avatar>({
		head: null,
		chest: null,
		legs: null,
		health: 100,
		defenceStyle: 0,
		attackStyle: 0
	});

	let mode = $state<'pre-encounter' | 'encounter' | 'post-encounter'>('pre-encounter');
	let win = $state<boolean>(false);

	function shuffle(array: unknown[]): unknown[] {
		let currentIndex = array.length,
			randomIndex;

		// While there remain elements to shuffle.
		while (currentIndex !== 0) {
			// Pick a remaining element.
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;
			// And swap it with the current element using array destructuring.
			[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
		}

		return array;
	}
	let encounterPowerups = $state<Array<Powerup>>([]);
	let rewardClothes = $state<Array<Clothing>>([]);

	let inventory = $state<Array<Clothing>>(newInventory());
	let boost = $state<number>(1);

	function recalculateStats() {
		let totalDefence = 0;
		let totalAttack = 0;

		boost = calculateSynergyBoost(avatar);

		if (avatar.head) {
			totalDefence += avatar.head.defenceStyle;
			totalAttack += avatar.head.attackStyle;
		}
		if (avatar.chest) {
			totalDefence += avatar.chest.defenceStyle;
			totalAttack += avatar.chest.attackStyle;
		}
		if (avatar.legs) {
			totalDefence += avatar.legs.defenceStyle;
			totalAttack += avatar.legs.attackStyle;
		}

		avatar.defenceStyle = Math.floor(totalDefence * boost);
		avatar.attackStyle = Math.floor(totalAttack * boost);
	}

	function pickReward(item: Clothing) {
		inventory.push(item);
		resetGame();
	}

	function unequipItem(item: Clothing) {
		if (item.for === 'head') {
			avatar.head = null;
		} else if (item.for === 'chest') {
			avatar.chest = null;
		} else if (item.for === 'legs') {
			avatar.legs = null;
		}
		recalculateStats();
	}

	function equipItem(item: Clothing) {
		if (item.for === 'head') {
			if (avatar.head) {
				unequipItem(avatar.head);
			}
			avatar.head = { ...item, synergy: false };
		} else if (item.for === 'chest') {
			if (avatar.chest) {
				unequipItem(avatar.chest);
			}
			avatar.chest = { ...item, synergy: false };
		} else if (item.for === 'legs') {
			if (avatar.legs) {
				unequipItem(avatar.legs);
			}
			avatar.legs = { ...item, synergy: false };
		}
		recalculateStats();
	}

	let grandTotal = $state(0);
	let endMsg = $state('');
	let yourDamage = $state(0);
	let enemyDamage = $state(0);

	let enemySprites = [enemy1, enemy2, enemy3, enemy5, enemy6];
	let enemySpriteIndex = 0;
	let enemySprite = enemySprites[enemySpriteIndex];

	let enemy = $state<Enemy>({
		sprite: enemySprite,
		defence: 8,
		attack: 8,
		health: 100
	});

	let turnNumber = $state(0);
	let encounterDamage = $state(0);

	function resetGame(): void {
		if (!win) {
			inventory = newInventory();
			grandTotal = 0;
		}
		endMsg = '';
		yourDamage = 0;
		enemyDamage = 0;

		enemySpriteIndex = Math.floor(Math.random() * enemySprites.length);
		enemy.sprite = enemySprites[enemySpriteIndex];

		enemy.health = 100;
		enemy.defence = Math.floor(Math.random() * 15) + 5;
		enemy.attack = Math.floor(Math.random() * 15) + 5;

		avatar.health = 100;
		avatar.defenceStyle = 1;
		avatar.attackStyle = 5;
		avatar.head = null;
		avatar.chest = null;
		avatar.legs = null;

		turnNumber = 0;
		mode = 'pre-encounter';
	}

	function pickRewards() {
		rewardClothes = [];
		let nonOwnedItems = extraClothes.filter((item) => !inventory.includes(item));
		shuffle(nonOwnedItems);
		for (let i = 0; i < Math.min(3, nonOwnedItems.length); i++) {
			rewardClothes.push(nonOwnedItems[i]);
		}
	}

	async function attack(avatar: Avatar, target: Enemy) {
		yourDamage = ((100 - target.defence) / 100) * avatar.attackStyle;
		enemyDamage = ((100 - avatar.defenceStyle) / 100) * target.attack;

		yourDamage = Math.floor(yourDamage);
		enemyDamage = Math.floor(enemyDamage);

		encounterDamage += yourDamage;

		target.health -= yourDamage;
		if (target.health <= 0) {
			target.health = 0;
			endMsg = 'You defeated the enemy!';
			win = true;
			mode = 'post-encounter';
			pickRewards();
		}

		avatar.health -= enemyDamage;
		if (avatar.health <= 0) {
			avatar.health = 0;
			endMsg = 'You were defeated!';
			win = false;
			mode = 'post-encounter';
		}
		turnNumber++;
		grandTotal += encounterDamage;
	}

	function toEncounterMode(): void {
		encounterDamage = 0;
		encounterPowerups = [];
		mode = 'encounter';
		shuffle(powerups);
		for (let i = 0; i < 3; i++) {
			encounterPowerups.push(powerups[i]);
		}
	}

	function usePowerup(powerup: Powerup): void {
		switch (powerup.effectTo) {
			case 'health':
				avatar.health *= 1 + powerup.value;
				avatar.health = Math.round(avatar.health);
				break;
			case 'attack':
				avatar.attackStyle *= 1 + powerup.value;
				avatar.attackStyle = Math.round(avatar.attackStyle);
				break;
			case 'defence':
				avatar.defenceStyle *= 1 + powerup.value;
				avatar.defenceStyle = Math.round(avatar.defenceStyle);
				break;
		}
		encounterPowerups = encounterPowerups.filter((p) => p !== powerup);
	}

	function roundTo(num: number, precision: number) {
		const factor = Math.pow(10, precision);
		return Math.round(num * factor) / factor;
	}

	const maxHealth = 100;
</script>

{#snippet healthBar(currentHealth: number, maxHealth: number)}
	<div class="flex w-full flex-col gap-2 rounded-md p-2">
		<h3 class="text-xl font-bold">Health</h3>
		<div class="h-6 w-96 border-4 border-black bg-gray-200">
			<div class="h-full bg-red-500" style="width: {(currentHealth / maxHealth) * 100}%"></div>
		</div>
	</div>
{/snippet}

{#snippet player()}
	<section class="flex w-full flex-col gap-8 p-2">
		<h3 class="text-5xl font-bold">Player</h3>
		<div class="flex flex-col gap-4">
			{@render healthBar(avatar.health, maxHealth)}
			<p class="text-2xl">Head</p>
			{#if avatar.head}
				<img
					class="h-36 w-36 {avatar.head.synergy ? 'animate-rainbow-pulse border-4' : ''}"
					src={avatar.head.sprite}
					alt="Head"
				/>
			{:else}
				<p class="text-xl">No clothing worn here.</p>
			{/if}
		</div>
		<div class="flex flex-col gap-4">
			<p class="text-2xl">Chest</p>
			{#if avatar.chest}
				<img
					class="h-36 w-36 {avatar.chest.synergy ? 'animate-rainbow-pulse border-4' : ''}"
					src={avatar.chest.sprite}
					alt="Chest"
				/>
			{:else}
				<p class="text-xl">No clothing worn here.</p>
			{/if}
		</div>
		<div class="flex flex-col gap-4">
			<p class="text-2xl">Legs</p>
			{#if avatar.legs}
				<img
					class="h-36 w-36 {avatar.legs.synergy ? 'animate-rainbow-pulse border-4' : ''}"
					src={avatar.legs.sprite}
					alt="Legs"
				/>
			{:else}
				<p class="text-xl">No clothing worn here.</p>
			{/if}
		</div>

		<div class="w-full border-t">
			<div>
				<p class="flex justify-between gap-4 text-2xl font-bold">
					Defence Style: <span>{avatar.defenceStyle}</span>
				</p>
				<p class="flex justify-between gap-4 text-2xl font-bold">
					Attack Style: <span>{avatar.attackStyle}</span>
				</p>
			</div>
		</div>
	</section>
{/snippet}

{#snippet enemyMarkup()}
	<section class="flex flex-col gap-2 rounded-md p-2">
		<h3 class="text-4xl font-bold">Enemy</h3>
		{@render healthBar(enemy.health, maxHealth)}
		<img src={enemy.sprite} alt="enemy sprite" />
		<div>
			<h2 class="text-3xl">Enemy Stats</h2>
			<div>
				<p class="text-2xl font-bold">defence: {enemy.defence}</p>
				<p class="text-2xl font-bold">attack: {enemy.attack}</p>
			</div>
		</div>
	</section>
{/snippet}

{#snippet clothingPiece(item: Clothing)}
	<button
		onclick={() => equipItem(item)}
		class="w-fit border border-gray-100 p-2 text-left shadow-md hover:scale-105 hover:border-gray-300 hover:shadow-lg"
	>
		<img class="h-24 w-24" src={item.sprite} alt={item.for} />
		<p class="flex justify-between gap-4">
			defence Style: <span>{item.defenceStyle}</span>
		</p>
		<p class="flex justify-between">attack style: <span>{item.attackStyle}</span></p>
		<div class="mt-1 flex flex-wrap gap-1">
			{#each item.tag as tag, index (index)}
				<span class="rounded bg-gray-200 px-1.5 py-0.5 text-xs font-normal">
					{tag.type}: {tag.value}
				</span>
			{/each}
		</div>
	</button>
{/snippet}

<div class="relative m-4 flex flex-col space-y-4 px-8">
	<p class="border-b pb-6 text-center font-mono text-5xl font-extrabold">{mode}</p>
	{#if mode === 'pre-encounter'}
		<div class="flex justify-around gap-8" transition:slide>
			{@render player()}
			<div class="flex w-full flex-col gap-2">
				<h2 class="text-5xl font-bold">Clothes Inventory</h2>
				<div class="flex flex-col gap-2">
					<h3 class="text-xl font-semibold">Head Clothing</h3>
					<div class="flex flex-wrap gap-4">
						{#each inventory.filter((item) => item.for === 'head') as item, index (index)}
							{@render clothingPiece(item)}
						{/each}
					</div>
				</div>
				<div class="flex flex-col gap-2">
					<h3 class="text-xl font-semibold">Chest Clothing</h3>
					<div class="flex flex-wrap gap-2">
						{#each inventory.filter((item) => item.for === 'chest') as item, index (index)}
							{@render clothingPiece(item)}
						{/each}
					</div>
				</div>
				<div class="flex flex-col gap-2">
					<h3 class="text-xl font-semibold">Legs Clothing</h3>
					<div class="flex flex-wrap gap-2">
						{#each inventory.filter((item) => item.for === 'legs') as item, index (index)}
							{@render clothingPiece(item)}
						{/each}
					</div>
				</div>
				<div>
					<p class="text-xl font-bold">Synergy Boost: {roundTo((boost - 1) * 100, 2)}%</p>
				</div>
				<button
					onclick={toEncounterMode}
					class="rainbow-pulse mt-2 ml-2 w-fit border px-3 py-1 text-2xl font-bold hover:scale-105 hover:shadow-lg active:scale-90"
					>Battle with fashion!</button
				>
			</div>
		</div>
	{:else if mode === 'encounter'}
		<div class="relative flex flex-col gap-8 space-y-6" transition:slide>
			<!-- <div
				class="absolute inset-0 top-0 right-0 bottom-0 left-0 -z-10"
				style="background-image:url({Background}); background-size: cover; background-position: center;"
			></div> -->
			<div class="flex items-center justify-between gap-6 px-8">
				<div>
					{@render player()}
					<div class="flex flex-col gap-4">
						<h3 class="my-2 text-2xl font-bold">Powerups</h3>
						<div class="flex gap-4">
							{#each encounterPowerups as powerup, index (index)}
								<div class="flex flex-col items-center">
									<button
										onclick={() => usePowerup(powerup)}
										class=" overflow-hidden rounded-full border-2 shadow hover:shadow-md {powerup.rarity ===
										'common'
											? 'border-green-500'
											: powerup.rarity === 'uncommon'
												? 'border-blue-500'
												: powerup.rarity === 'rare'
													? 'border-purple-500'
													: 'border-gray-500'}"
									>
										<img class="h-24 w-24" src={powerup.sprite} alt={powerup.name} />
									</button>
									<p class="text-xl">{powerup.name}</p>
									<p class="text-xl">{powerup.value * 100}% {powerup.effectTo} boost</p>
								</div>
							{/each}
						</div>
					</div>

					<div class="flex flex-col gap-4">
						<p>Turn: {turnNumber}</p>
						<button
							onclick={() => attack(avatar, enemy)}
							class="w-fit border px-3 py-1 text-3xl shadow hover:shadow-md">Attack</button
						>
					</div>
				</div>
				<p class="text-9xl font-bold">VS</p>
				{@render enemyMarkup()}
			</div>
		</div>
	{:else if mode === 'post-encounter'}
		<div class="flex flex-col items-center gap-4" transition:slide>
			<p class="text-6xl font-bold">
				You got <span
					class="animate-pulse bg-linear-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-9xl font-extrabold text-transparent"
					>{encounterDamage}</span
				> Style Points!
			</p>
			{#if win}
				<p class="text-6xl font-semibold">{endMsg}</p>

				{#if rewardClothes.length !== 0}
					<h3 class="text-xl font-bold">Pick a Reward</h3>
					<div class="flex gap-6">
						{#each rewardClothes as item, index (index)}
							<button
								onclick={() => {
									pickReward(item);
								}}
								class="w-fit border border-black p-2 text-left shadow hover:shadow-md"
							>
								<img class="h-60 w-60" src={item.sprite} alt={item.for} />
								<p class="flex justify-between gap-4">
									defence Style: <span>{item.defenceStyle}</span>
								</p>
								<p class="flex justify-between">attack style: <span>{item.attackStyle}</span></p>
								<div class="mt-1 flex flex-wrap gap-1">
									{#each item.tag as tag, index (index)}
										<span class="rounded bg-gray-200 px-1.5 py-0.5 text-xs font-normal">
											{tag.type}: {tag.value}
										</span>
									{/each}
								</div>
							</button>
						{/each}
					</div>
				{:else}
					<p>No rewards available</p>
				{/if}
			{:else}
				<p class="text-4xl">{endMsg}</p>
				<p class="text-5xl">Grand Total Style Points:</p>
				<p
					class="animate-pulse bg-linear-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-9xl font-extrabold text-transparent"
				>
					{grandTotal}sp
				</p>
			{/if}

			<button
				onclick={() => {
					resetGame();
				}}
				class="w-fit border border-black px-3 py-1 text-5xl shadow hover:shadow-md"
				>Play Again</button
			>
		</div>
	{/if}
</div>

<style>
	button {
		@apply transition-all duration-150 active:scale-90;
		border-radius: 0.5rem;
		cursor: pointer;
	}
	span {
		font-weight: bold;
	}

	@keyframes rainbow-pulse {
		0%,
		100% {
			border-color: red;
		}
		14% {
			border-color: lightsalmon;
		}
		28% {
			border-color: yellow;
		}
		42% {
			border-color: pink;
		}
		57% {
			border-color: blue;
		}
		71% {
			border-color: indigo;
		}
		85% {
			border-color: violet;
		}
		95% {
			border-color: purple;
		}
	}

	.animate-rainbow-pulse {
		animation: rainbow-pulse 5s infinite;
		border-radius: 0.5rem;
	}
</style>
