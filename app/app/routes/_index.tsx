import type { MetaFunction } from 'react-router';

export const meta: MetaFunction = () => {
  return [
    { title: 'New React Router v7 App' },
    { name: 'description', content: 'Welcome to React Router v7!' },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <h1>Welcome to React Router v7</h1>
      <ul>
        <li>
          <a
            target="_blank"
            href="https://reactrouter.com/tutorials/address-book"
            rel="noreferrer"
          >
            Adress Book App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://reactrouter.com/home" rel="noreferrer">
            React Router v7 Docs
          </a>
        </li>
      </ul>
    </div>
  );
}
