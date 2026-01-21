// place files you want to import through the `$lib` alias in this folder.
export type Tag =
	| { type: 'brand'; value: 'aberole' | 'vivannet' | 'dossi' }
	| { type: 'color'; value: 'red' | 'blue' | 'yellow' }
	| { type: 'vibe'; value: 'casual' | 'sporty' | 'gothic' };

export type Clothing = {
	sprite: string;
	defenceStyle: number;
	attackStyle: number;
	for: 'head' | 'chest' | 'legs';
	id: number;
	tag: Tag[];
};

export type Avatar = {
	head: (Clothing & { synergy: boolean }) | null;
	chest: (Clothing & { synergy: boolean }) | null;
	legs: (Clothing & { synergy: boolean }) | null;

	health: number;
	defenceStyle: number;
	attackStyle: number;
};

export type Enemy = {
	sprite: string;
	health: number;
	defence: number;
	attack: number;
};

export type Powerup = {
	sprite: string;
	effectTo: 'health' | 'defence' | 'attack';
	value: number;
	rarity: 'common' | 'uncommon' | 'rare';
	name: string;
};

export const powerups: Powerup[] = [
	{
		sprite:
			'https://cdn-media.glamira.com/media/product/newgeneration/view/1/sku/21193gisu1-round/diamond/diamond-zirconia_AAAAA/stone2/diamond-zirconia_AAAAA/stone3/diamond-zirconia_AAAAA/alloycolour/yellow.jpg',
		effectTo: 'health',
		value: 0.05,
		rarity: 'common',
		name: 'Ring of health'
	},
	{
		sprite:
			'https://static.diamondsfactory.com/image/product_v2/clrn07097/rf0122902/showcase/front/yy/di/0001.jpg',
		effectTo: 'defence',
		value: 0.05,
		rarity: 'common',
		name: 'Ring of defence'
	},
	{
		sprite:
			'https://ion.bluenile.com/sets/Jewelry/Photoshoot/Bluenile/BrioPackshot/Custom/BNS01xBNH01/BNS01xBNH01_RND/BNS01xBNH01_M1_RND_DIM_wht_0100CT_W_W/BNS01xBNH01_M1_RND_DIM_wht_0100CT_W_W.001.jpg',
		effectTo: 'attack',
		value: 0.05,
		rarity: 'common',
		name: 'Ring of attack'
	},
	{
		sprite:
			'https://media.tiffany.com/is/image/Tiffany/EcomItemL2/tiffany-1837circle-pendant-73130344_1062483_ED.jpg',
		effectTo: 'health',
		value: 0.1,
		rarity: 'uncommon',
		name: 'Necklace of health'
	},
	{
		sprite: 'https://spencediamonds.com/assets/29885-A.png',
		effectTo: 'defence',
		value: 0.1,
		rarity: 'uncommon',
		name: 'Necklace of defence'
	},
	{
		sprite:
			'https://cdn-media.glamira.com/media/product/newgeneration/view/1/sku/men-yarden/diamond/browndiamond_AAA/alloycolour/yellow.jpg',
		effectTo: 'attack',
		value: 0.15,
		rarity: 'rare',
		name: 'Necklace of attack'
	},
	{
		sprite:
			'https://media.debeers.com/i/debeers/E103343_70?fmt=auto&fmt.webp.qlt=65&fmt.jp2.qlt=40&fmt.jpeg.qlt=65&$new-plp-grid-desktop-1-1-3000-poi$',
		effectTo: 'health',
		value: 0.1,
		rarity: 'uncommon',
		name: 'Earring of health'
	},
	{
		sprite:
			'https://pilgrim.ca/cdn/shop/products/262312063_33fe1723-cc6f-4992-842b-f49006127b4e-208182_x1100.jpg?v=1689598133',
		effectTo: 'defence',
		value: 0.15,
		rarity: 'rare',
		name: 'Earring of defence'
	},
	{
		sprite:
			'https://asset.swarovski.com/images/$size_1450/t_swa103/b_rgb:ffffff,c_scale,dpr_1.0,f_auto,w_375/5646733_png_var2/una-drop-earrings--round-cut--white--gold-tone-plated-swarovski-5646733.png',
		effectTo: 'attack',
		value: 0.05,
		rarity: 'common',
		name: 'Earring of attack'
	}
];

export const extraClothes: Clothing[] = [
	{
		sprite:
			'https://www.emp.co.uk/dw/image/v2/BBQV_PRD/on/demandware.static/-/Sites-master-emp/default/dw2e9f1013/images/5/7/0/3/570386a.jpg?sfrm=png',
		for: 'chest',
		defenceStyle: 8,
		attackStyle: 2,
		id: 3546789,
		tag: [{ type: 'vibe', value: 'gothic' }]
	},
	{
		sprite: 'https://sportyandrich.com/cdn/shop/files/SERIFLOGOSPORTSTANKNAVY2.jpg?v=1699971599',
		for: 'chest',
		defenceStyle: 7,
		attackStyle: 3,
		id: 23,
		tag: [{ type: 'vibe', value: 'sporty' }]
	},
	{
		sprite:
			'https://dynamic-cdn.zenegal.store/fit-in/700x1050/products/55798/boys-bottom-16945867248233.jpg',
		for: 'legs',
		defenceStyle: 10,
		attackStyle: 2,
		id: 12349,
		tag: [{ type: 'vibe', value: 'casual' }]
	},
	{
		sprite:
			'https://www.pretty-attitude.com/cdn/shop/files/gothic-bell-bottoms-4_1024x1024.jpg?v=1717243628',
		for: 'legs',
		defenceStyle: 9,
		attackStyle: 3,
		id: 1234569,
		tag: [
			{ type: 'vibe', value: 'gothic' },
			{ type: 'brand', value: 'aberole' }
		]
	},
	{
		sprite:
			'https://cdn.vectorstock.com/i/500p/44/47/vibrant-red-japanese-tengu-mask-vector-61374447.jpg',
		for: 'head',
		defenceStyle: 8,
		attackStyle: 3,
		id: 12567,
		tag: [{ type: 'color', value: 'red' }]
	},
	{
		sprite:
			'https://sites.create-cdn.net/siteimages/5/0/3/50308/20/1/5/20157391/1000x750.jpg?1663311266',
		for: 'head',
		defenceStyle: 4,
		attackStyle: 6,
		id: 17,
		tag: [
			{ type: 'color', value: 'blue' },
			{ type: 'brand', value: 'vivannet' }
		]
	}
];

export function newInventory(): Array<Clothing> {
	return [
		{
			sprite:
				'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTS0mNwhUWnRYBKJXxNfot5_vHy87HhptMYA&s',
			defenceStyle: 7,
			attackStyle: 9,
			for: 'head',
			id: 1,
			tag: [
				{ type: 'color', value: 'yellow' },
				{ type: 'brand', value: 'dossi' }
			]
		},
		{
			sprite: 'https://tfashionmart.com/cdn/shop/products/bluedodgersfitted.jpg',
			defenceStyle: 6,
			attackStyle: 12,
			for: 'head',
			id: 2,
			tag: [
				{ type: 'brand', value: 'vivannet' },
				{ type: 'color', value: 'blue' },
				{ type: 'vibe', value: 'sporty' }
			]
		},
		{
			sprite:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Red_Hat_logo.svg/250px-Red_Hat_logo.svg.png',
			defenceStyle: 9,
			attackStyle: 9,
			for: 'head',
			id: 3,
			tag: [
				{ type: 'brand', value: 'aberole' },
				{ type: 'color', value: 'red' }
			]
		},
		{
			sprite: 'https://m.media-amazon.com/images/I/51Kwn-j-8eL._AC_SL1001_.jpg',
			defenceStyle: 6,
			attackStyle: 15,
			for: 'chest',
			id: 4,
			tag: [{ type: 'brand', value: 'dossi' }]
		},
		{
			sprite:
				'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQwJCmnST-pcu0vvRiqt2Uv0kPq8VHyBHMew&s',
			defenceStyle: 4,
			attackStyle: 10,
			for: 'legs',
			id: 5,
			tag: [{ type: 'brand', value: 'dossi' }]
		}
	];
}

// Start Claude
function calculateSynergies(avatar: Avatar): number {
	const equippedPieces = [avatar.head, avatar.chest, avatar.legs].filter(
		(piece): piece is Clothing & { synergy: boolean } => piece !== null
	);

	if (equippedPieces.length < 2) return 0;

	const synergies = new Set<string>();

	// Compare each pair of equipped clothing pieces
	for (let i = 0; i < equippedPieces.length; i++) {
		for (let j = i + 1; j < equippedPieces.length; j++) {
			const piece1 = equippedPieces[i];
			const piece2 = equippedPieces[j];

			// Check for matching tags
			for (const tag1 of piece1.tag) {
				for (const tag2 of piece2.tag) {
					if (tag1.type === tag2.type && tag1.value === tag2.value) {
						// Create a unique key for this synergy
						// Include piece positions to count blue-blue once per pair
						const positions = [i, j].sort().join('-');
						const synergyKey = `${tag1.type}:${tag1.value}:${positions}`;
						synergies.add(synergyKey);
						piece1.synergy = true;
						piece2.synergy = true;
					}
				}
			}
		}
	}
	return synergies.size;
}

export function calculateSynergyBoost(avatar: Avatar): number {
	const synergyCount = calculateSynergies(avatar);
	const damageMultiplier = 1 + synergyCount * 0.05;
	return damageMultiplier;
}
// End Claude
