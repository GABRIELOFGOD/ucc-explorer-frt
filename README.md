# Universe Chain Explorer Frontend

This is the frontend application for the Universe Chain Explorer, built with Next.js.

## Features

- Modern glass-morphism design with responsive layout
- Real-time updates using WebSocket
- Network dashboard with real-time statistics
- Block and transaction browsing with pagination
- Address details with contract verification
- Smart contract interaction (Read/Write)
- Token and validator information
- Search functionality
- Charts and network statistics
- API documentation
- Contract verification interface

## Technologies Used

- Next.js 13
- React 18
- Axios for API requests
- Socket.IO Client for WebSocket connections
- Font Awesome for icons
- CSS with glass-morphism design

## Pages

### Dashboard
- Network overview with latest blocks and transactions
- Real-time updates using WebSocket

### Blocks
- Paginated list of blocks
- Block details view

### Transactions
- Paginated list of transactions
- Transaction details view

### Addresses
- Address details with transaction history
- Contract information for smart contracts
- Read/Write contract interaction for verified contracts
- Verification button for unverified contracts

### Tokens
- Token information

### Validators
- Validator information

### Verify Contract
- Interface for smart contract verification

### API Docs
- Comprehensive API documentation
- Endpoint details and examples
- Rate limiting information

### Charts
- Network statistics and visualizations

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd universe-chain-explorer-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The application will be available at [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Project Structure

```
universe-chain-explorer-frontend/
├── package.json
├── next.config.js
├── pages/
│   ├── index.js
│   ├── blocks.js
│   ├── block/[id].js
│   ├── transactions.js
│   ├── tx/[id].js
│   ├── addresses.js
│   ├── address/[id].js
│   ├── tokens.js
│   ├── validators.js
│   ├── verify-contract.js
│   ├── api-docs.js
│   └── charts.js
├── components/
│   └── Layout.js
├── styles/
│   └── globals.css
├── utils/
│   └── api.js
└── README.md
```

## Customization

You can customize the frontend by:

1. Modifying the CSS variables in `styles/globals.css`
2. Updating the network information in the sidebar
3. Adding new pages or modifying existing ones
4. Changing the color scheme in the CSS variables

## Deployment

The frontend can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.