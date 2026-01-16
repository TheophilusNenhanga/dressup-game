<script lang="ts">
	import {
		type Tag,
		type Clothing,
		type Avatar,
		type Enemy,
		type Powerup,
		powerups,
		extraClothes,
		newInventory
	} from '$lib/index';

	let avatar = $state<Avatar>({
		head: null,
		chest: null,
		legs: null,
		health: 100,
		defenceStyle: 1,
		attackStyle: 5
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

	function recalculateStats() {
		let totalDefence = 0;
		let totalAttack = 0;
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
		avatar.defenceStyle = totalDefence;
		avatar.attackStyle = totalAttack;
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
			avatar.head = item;
		} else if (item.for === 'chest') {
			if (avatar.chest) {
				unequipItem(avatar.chest);
			}
			avatar.chest = item;
		} else if (item.for === 'legs') {
			if (avatar.legs) {
				unequipItem(avatar.legs);
			}
			avatar.legs = item;
		}
		recalculateStats();
	}

	let endMsg = $state('');
	let rollDieVid = $state(false);
	let yourMultiplier = $state(1);
	let enemyMultiplier = $state(1);
	let yourDie = $state(0);
	let enemyDie = $state(0);
	let yourDamage = $state(0);
	let enemyDamage = $state(0);

	let enemy = $state<Enemy>({
		sprite:
			'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRK3KPjPwcINGG6hMNDOANfvmTgIAQ1vrOTnw&s',
		defence: 8,
		attack: 8,
		health: 100
	});

	let turnNumber = $state(0);
	let encounterDamage = $state(0);

	function resetGame(): void {
		if (!win) {
			inventory = newInventory();
		}
		endMsg = '';
		rollDieVid = false;
		yourMultiplier = 1;
		enemyMultiplier = 1;
		yourDie = 0;
		enemyDie = 0;
		yourDamage = 0;
		enemyDamage = 0;

		enemy.health = 100;
		enemy.defence = Math.floor(Math.random() * 10) + 15;
		enemy.attack = Math.floor(Math.random() * 10) + 15;

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
		rollDieVid = true;
		await new Promise((resolve) => setTimeout(resolve, 1000));
		rollDieVid = false;

		yourDie = Math.ceil(Math.random() * 6);
		enemyDie = Math.ceil(Math.random() * 6);

		yourMultiplier = 1 + yourDie / 10;
		enemyMultiplier = 1 + enemyDie / 10;

		yourDamage = ((100 - target.defence) / 100) * (avatar.attackStyle * yourMultiplier);
		enemyDamage = ((100 - avatar.defenceStyle) / 100) * (target.attack * enemyMultiplier);

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
</script>

{#snippet player()}
	<section class="flex w-fit flex-col gap-2 rounded-md border p-2">
		<h3 class="text-xl font-bold">Player</h3>
		<div class="flex flex-col">
			<p>Head</p>
			{#if avatar.head}
				<img class="h-12 w-12" src={avatar.head.sprite} alt="Head" />
			{:else}
				<p>No clothing worn here.</p>
			{/if}
		</div>
		<div class="flex flex-col">
			<p>Chest</p>
			{#if avatar.chest}
				<img class="h-12 w-12" src={avatar.chest.sprite} alt="Chest" />
			{:else}
				<p>No clothing worn here.</p>
			{/if}
		</div>
		<div class="flex flex-col">
			<p>Legs</p>
			{#if avatar.legs}
				<img class="h-12 w-12" src={avatar.legs.sprite} alt="Legs" />
			{:else}
				<p>No clothing worn here.</p>
			{/if}
		</div>

		<div class="w-full border-t">
			<div>
				<p class="flex justify-between gap-4 font-bold">Health: <span>{avatar.health}</span></p>
				<p class="flex justify-between gap-4 font-bold">
					Defence Style: <span>{avatar.defenceStyle}</span>
				</p>
				<p class="flex justify-between gap-4 font-bold">
					Attack Style: <span>{avatar.attackStyle}</span>
				</p>
			</div>
		</div>
	</section>
{/snippet}

{#snippet enemyMarkup()}
	<section class="flex flex-col gap-2 rounded-md border p-2">
		<h3 class="text-xl font-bold">Enemy</h3>
		<img class="h-24 w-24" src={enemy.sprite} alt="enemy sprite" />
		<div class="w-fit">
			<h2>Enemy Stats</h2>
			<div>
				<p class="font-bold">health: {enemy.health}</p>
				<p class="font-bold">defence: {enemy.defence}</p>
				<p class="font-bold">attack: {enemy.attack}</p>
			</div>
		</div>
	</section>
{/snippet}

<div class="relative m-4 flex flex-col space-y-4">
	<div class="">
		<p class="text-muted-foreground font-serif text-5xl font-extrabold">{mode}</p>
	</div>
	{#if mode === 'pre-encounter'}
		{@render player()}

		<div class="flex flex-col gap-2">
			<h2 class="text-2xl font-bold">Clothes Inventory</h2>
			<div class="flex flex-col gap-2">
				<h3 class="text-xl font-semibold">Head Clothing</h3>
				<div class="flex flex-wrap gap-2">
					{#each inventory.filter((item) => item.for === 'head') as item, index (index)}
						<button
							onclick={() => equipItem(item)}
							class="w-fit border border-black p-2 text-left shadow hover:shadow-md"
						>
							<img class="h-12 w-12" src={item.sprite} alt={item.for} />
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
			</div>
			<div class="flex flex-col gap-2">
				<h3 class="text-xl font-semibold">Chest Clothing</h3>
				<div class="flex flex-wrap gap-2">
					{#each inventory.filter((item) => item.for === 'chest') as item, index (index)}
						<button
							onclick={() => equipItem(item)}
							class="w-fit border border-black p-2 text-left shadow hover:shadow-md"
						>
							<img class="h-12 w-12" src={item.sprite} alt={item.for} />
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
			</div>
			<div class="flex flex-col gap-2">
				<h3 class="text-xl font-semibold">Legs Clothing</h3>
				<div class="flex flex-wrap gap-2">
					{#each inventory.filter((item) => item.for === 'legs') as item, index (index)}
						<button
							onclick={() => equipItem(item)}
							class="w-fit border border-black p-2 text-left shadow hover:shadow-md"
						>
							<img class="h-12 w-12" src={item.sprite} alt={item.for} />
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
			</div>
			<button
				onclick={toEncounterMode}
				class="mt-2 ml-2 w-fit border px-3 py-1 text-xl font-semibold hover:shadow"
				>Ready to battle with style!</button
			>
		</div>
	{:else if mode === 'encounter'}
		<div class="flex flex-col space-y-6">
			<div class="flex items-center gap-6">
				{@render player()}
				<p class="text-5xl font-bold">VS</p>
				{@render enemyMarkup()}
			</div>

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
						<p>{powerup.name}</p>
					</div>
				{/each}
			</div>

			<div class="flex flex-col gap-4">
				<p>Turn: {turnNumber}</p>
				<button
					onclick={() => attack(avatar, enemy)}
					class=" w-fit border border-black px-3 py-1 shadow hover:shadow-md">Attack</button
				>
				{#if rollDieVid === true}
					<div class="flex flex-col items-center justify-center">
						<p>Rolling die...</p>
						<img
							src="https://i.pinimg.com/originals/75/09/82/750982c4ccc4737e643207f54c40170a.gif"
							alt="Rolling die"
							class="h-24 w-24"
						/>
					</div>
				{/if}

				<div class="flex flex-col gap-4">
					<div>
						<p>Your roll: {yourDie}</p>
						<p>Enemy roll: {enemyDie}</p>
					</div>

					<div>
						<p>Your multiplier: {yourMultiplier}</p>
						<p>Enemy multiplier: {enemyMultiplier}</p>
					</div>
					<div>
						<p>Your damage: {yourDamage}</p>
						<p>Enemy damage: {enemyDamage}</p>
					</div>

					<div class="text-muted-foreground space-y-4">
						<div>
							<p>Damage formula:</p>
							<p>((100 - target.defence) / 100) * (avatar.attack * yourMultiplier)</p>
						</div>
						<div>
							<p>Powerup Effect:</p>
							<p>avatar.[health|attack|defence] *= 1 + powerup.value;</p>
							<small>powerup values are between 0 and 1</small>
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else if mode === 'post-encounter'}
		<div class="flex flex-col gap-4">
			<p class="text-2xl font-bold">
				You got <span
					class="animate-pulse bg-linear-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-6xl font-extrabold text-transparent"
					>{encounterDamage}</span
				> Style Points!
			</p>
			{#if win}
				<p class="text-xl font-semibold">{endMsg}</p>

				<div>
					<div>
						{#if rewardClothes.length !== 0}
							<h3 class="text-xl font-bold">Pick a Reward</h3>
							{#each rewardClothes as item, index (index)}
								<button
									onclick={() => {
										pickReward(item);
									}}
									class="w-fit border border-black p-2 text-left shadow hover:shadow-md"
								>
									<img class="h-12 w-12" src={item.sprite} alt={item.for} />
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
						{:else}
							<p>No rewards available</p>
						{/if}
					</div>
				</div>
			{:else}
				<p>{endMsg}</p>
			{/if}

			<button
				onclick={() => {
					resetGame();
				}}
				class="w-fit border border-black px-3 py-1 shadow hover:shadow-md">Play Again</button
			>
		</div>
	{/if}
</div>

<style>
	button {
		@apply transition-all duration-150 active:scale-90;
		border-radius: 1rem;
		cursor: pointer;
	}
	span {
		font-weight: bold;
	}
</style>
