// PlayerApp.jsx — the mobile player surface: app state (signed-in player, club
// membership) + screen-name → component mapping for the animated Navigator.

import { useState } from 'react';
import { PhoneFrame } from '../components/mobile';
import { Navigator } from '../navigation/nav';
import { SAMPLE_PLAYER } from '../data';

import SignupScreen from '../screens/SignupScreen';
import ProfileHomeScreen from '../screens/ProfileHomeScreen';
import CardCloseupScreen from '../screens/CardCloseupScreen';
import JuniorsScreen from '../screens/JuniorsScreen';
import ClubsLockedScreen from '../screens/ClubsLockedScreen';
import JoinClubScreen from '../screens/JoinClubScreen';
import MyClubScreen from '../screens/MyClubScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';

export default function PlayerApp() {
  const [player, setPlayer] = useState(SAMPLE_PLAYER);
  const [clubJoined, setClubJoined] = useState(false);
  const app = { player, setPlayer, clubJoined, setClubJoined };

  function render(entry) {
    const { name, params } = entry;
    switch (name) {
      case 'signup':
        return <SignupScreen />;
      case 'profile':
        return <ProfileHomeScreen justCreated={params.justCreated} />;
      case 'players':
        return <JuniorsScreen />;
      case 'clubs':
        return clubJoined ? <MyClubScreen /> : <ClubsLockedScreen />;
      case 'discover':
        return <PlaceholderScreen tab="discover" />;
      case 'bookings':
        return <PlaceholderScreen tab="bookings" />;
      case 'cardCloseup':
        return <CardCloseupScreen player={params.player} ownCard={params.player?.id === player.id} />;
      case 'joinClub':
        return <JoinClubScreen />;
      default:
        return <SignupScreen />;
    }
  }

  return (
    <PhoneFrame>
      <Navigator initial="signup" render={render} app={app} />
    </PhoneFrame>
  );
}
