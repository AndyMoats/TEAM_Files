const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://www.lwhs.org/athletics/calendar-results';

// Function to fetch and scrape the website
async function scrapeData() {
    try {
        // Fetching HTML from the URL
        const { data } = await axios.get(url);

        // Load HTML into cheerio
        const $ = cheerio.load(data);

        // Create an array to store the scraped data
        const results = [];

        // Select and iterate over table rows in the tbody of the .fsEventTable
        $('.fsEventTable tbody tr').each((index, element) => {
            // Skip the "Load More" button row
            if (!$(element).hasClass('fsLoadMoreButtonRow')) {
                const row = {
                    team: $(element).find('.fsTitle').text().trim(),
                    opponent: $(element).find('.fsAthleticsOpponentName').text().trim(),
                    date: $(element).find('.fsAthleticsDate time').attr('datetime'),
                    time: $(element).find('.fsAthleticsTime time').attr('datetime'),
                    location: $(element).find('.fsAthleticsLocations').text().trim(),
                    advantage: $(element).find('.fsAthleticsAdvantage').text().trim(),
                    detailsLink: $(element).find('.fsAthleticsDetails a').attr('href')
                };
                results.push(row);
            }
        });

        // Structure the data with a 'games' key
        const jsonData = {
            games: results
        };

        // Save results to a JSON file
        fs.writeFile('athletics.json', JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                console.error('Error writing to file:', err);
                return;
            }
            console.log('Data has been saved to athletics.json');
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Call the scrape function
scrapeData();