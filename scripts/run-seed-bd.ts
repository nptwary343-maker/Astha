import { seedBDProducts } from './seed-bd-products';

async function main() {
    try {
        await seedBDProducts();
        process.exit(0);
    } catch (e) {
        console.error("Critical Seeding Error:", e);
        process.exit(1);
    }
}

main();
