const fs = require('node:fs');
const path = require('node:path');
const { Readable } = require('stream');
const { finished } = require('stream/promises');

const BASE_URL = 'https://clubs.essiebes.nl/virtual-dolls/api';
const PUBLIC_BASE_URL = 'https://club-virtual-dolls.github.io/public-assets'
const API_TOKEN = process.env.API_TOKEN;
const placeholders = ['bc7df3e1-317f-4074-b417-4c880556511d'];

const staffDoesNotHavePlaceHolderPortret = (staff) => {
    return !placeholders.includes(staff.portret);
}

(async () => {
    fs.mkdirSync('./staff_photos/', { recursive: true })

    const staffResponse = await fetch(`${BASE_URL}/items/staff?fields=id,roles,name,portret&limit=-1&filter[status][_eq]=published`);

    if (!staffResponse.ok) {
        throw new Error(`Failed to fetch staff: ${staffResponse.statusText}`);
    }

    const staffs = (await staffResponse.json()).data;
    console.log(`Found ${staffs.length} staff members.`);
    console.log(staffs);

    for (const staff of staffs) {
        if (!staffDoesNotHavePlaceHolderPortret(staff)) continue;
        const image = await fetch(`${BASE_URL}/assets/${staff.portret}?key=vrchat-1024-9x16`);
        if (!image.ok) {
            throw new Error(`Failed to fetch image: ${image.statusText}`);
        }

        const destination = path.resolve('./staff_photos', `${staff.id}.png`);
        const fileStream = fs.createWriteStream(destination, { flags: 'w' });
        await finished(Readable.fromWeb(image.body).pipe(fileStream));
        console.log(`Downloaded image for ${staff.name} to ./staff_photos/${staff.id}.png`);
    }

    const csvList = staffs
        .filter(staffDoesNotHavePlaceHolderPortret)
        .map(s => `${PUBLIC_BASE_URL}/staff_photos/${s.id}.png`);
    fs.writeFileSync(path.resolve('./staff_photos', `index.csv`), `${csvList.join('\n')}`);
    console.log('Wrote staff photos index to ./staff_photos/index.csv');
})();