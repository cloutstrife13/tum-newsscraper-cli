# tum-newsscraper-cli
CLI-based web scraper for extracting data from newspaper articles based on CSS Selectors. Built using Prisma, Puppeteer, Commander and Ora for a Social Science team of the Technical University of Munich

# Prerequisites
- Node.js
- MySQL
- Yarn

# Usage
Once the prerequisites have been installed on your computer, ensure that you are in the project root folder.

Issue the following command in the terminal to install the dependencies of the tool: 
```bash
yarn
```

Afterwards, you can issue the base command with the help flag to see all possible options of the command line tool:
```bash
yarn dev --help
```

Please make sure to edit the `.env` in the project root by targetting the connection string of your MySQL instance:
```
DATABASE_URL=mysql://username:password@host:port/dbname
```

An example connection string looks like this:
```
DATABASE_URL=mysql://superuser33:mypassword133@localhost:3000/mydatabase
```

After declaring your connection string, upload the database schema to MySQL using the following command:
```bash
yarn migrate
```

To initialise the application for the first time, issue the initialise command:
```bash
yarn dev initialise
```

An example command shows how to collect the URLs from multiple domains:
```bash
yarn dev collect gal-dem.com lgbtqnation.com
```

Another example provides the means of crawling the articles of multiple domains for marking their URLs by 1000 publication dates as of the 1st January 2015
```bash
yarn dev scan gal-dem.com lgbtqnation.com -r 1000 -s 2015
```

# Build

Will be added later...
