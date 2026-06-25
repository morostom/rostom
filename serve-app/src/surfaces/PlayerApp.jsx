// PlayerApp.jsx — the mobile player surface. Holds onboarding + app state and
// maps screen names to components for the animated Navigator.

import { useState } from 'react';
import { PhoneFrame } from '../components/mobile';
import { Navigator } from '../navigation/nav';
import { EMPTY_COMPETITIVE } from '../data';

import AuthScreen from '../screens/AuthScreen';
import WhoForScreen from '../screens/WhoForScreen';
import CompeteScreen from '../screens/CompeteScreen';
import BuildCardScreen from '../screens/BuildCardScreen';
import ProfileHomeScreen from '../screens/ProfileHomeScreen';
import CardCloseupScreen from '../screens/CardCloseupScreen';
import ClubsLockedScreen from '../screens/ClubsLockedScreen';
import JoinClubScreen from '../screens/JoinClubScreen';
import MyClubScreen from '../screens/MyClubScreen';
import ClubScheduleScreen from '../screens/ClubScheduleScreen';
import BookCourtScreen from '../screens/BookCourtScreen';
import PaymentScreen from '../screens/PaymentScreen';
import BookingsScreen from '../screens/BookingsScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ClubBioScreen from '../screens/ClubBioScreen';
import AcademyScreen from '../screens/AcademyScreen';

export default function PlayerApp() {
  const [account, setAccount] = useState(null);
  const [forChild, setForChild] = useState(false);
  const [cardType, setCardType] = useState('competitive');
  const [player, setPlayer] = useState(EMPTY_COMPETITIVE);
  const [clubJoined, setClubJoined] = useState(false);

  const app = { account, setAccount, forChild, setForChild, cardType, setCardType, player, setPlayer, clubJoined, setClubJoined };

  function render(entry) {
    const { name, params } = entry;
    switch (name) {
      case 'auth': return <AuthScreen />;
      case 'whoFor': return <WhoForScreen />;
      case 'compete': return <CompeteScreen />;
      case 'build': return <BuildCardScreen />;
      case 'profile': return <ProfileHomeScreen justCreated={params.justCreated} />;
      case 'clubs': return clubJoined ? <MyClubScreen /> : <ClubsLockedScreen />;
      case 'clubSchedule': return <ClubScheduleScreen />;
      case 'book': return <BookCourtScreen court={params.court} />;
      case 'payment': return <PaymentScreen {...params} />;
      case 'bookings': return <BookingsScreen />;
      case 'discover': return <DiscoverScreen />;
      case 'clubBio': return <ClubBioScreen />;
      case 'academy': return <AcademyScreen academy={params.academy} />;
      case 'cardCloseup': return <CardCloseupScreen player={params.player} ownCard={params.player?.id === player.id} />;
      case 'joinClub': return <JoinClubScreen />;
      default: return <AuthScreen />;
    }
  }

  return (
    <PhoneFrame>
      <Navigator initial="auth" render={render} app={app} />
    </PhoneFrame>
  );
}
