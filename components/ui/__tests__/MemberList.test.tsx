// components/ui/__tests__/MemberList.test.tsx

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import * as friendsModule from '../../../stores/friendsStore';
import MemberList, { Member } from '../MemberList';

// 1) Mock store z dynamicznym stanem, eksponujemy setter
jest.mock('../../../stores/friendsStore', () => {
    const mockFetch = jest.fn();
    const store = {
        friends: [
            { id: '1', requester_id: '1', recipient_id: '1', status: 'accepted', user_email: 'a@example.com' },
            { id: '2', requester_id: '2', recipient_id: '2', status: 'pending', user_email: 'b@example.com' },
            { id: '3', requester_id: '3', recipient_id: '3', status: 'accepted', user_email: 'c@example.com' },
        ],
        fetchFriends: mockFetch,
    };
    return {
        __fetchFriendsMock: mockFetch,
        __setFriendsData: (newFriends: typeof store.friends) => { store.friends = newFriends; },
        useFriendsStore: () => store,
    };
});

const { __fetchFriendsMock, __setFriendsData } = friendsModule;

describe('MemberList Component', () => {
    beforeEach(() => {
        // reset fetch mock
        __fetchFriendsMock.mockClear();
        // restore default friends
        __setFriendsData([
            { id: '1', requester_id: '1', recipient_id: '1', status: 'accepted', user_email: 'a@example.com' },
            { id: '2', requester_id: '2', recipient_id: '2', status: 'pending', user_email: 'b@example.com' },
            { id: '3', requester_id: '3', recipient_id: '3', status: 'accepted', user_email: 'c@example.com' },
        ]);
    });

    it('calls fetchFriends on mount', () => {
        render(<MemberList isOwner={false} members={[]} />);
        expect(__fetchFriendsMock).toHaveBeenCalledTimes(1);
    });

    it('renders "Brak znajomych" if there are no accepted friends', () => {
        // only pending friends
        __setFriendsData([
            { id: 'x', requester_id: 'x', recipient_id: 'x', status: 'pending', user_email: 'none@example.com' },
        ]);

        const { getByText } = render(<MemberList isOwner={false} members={[]} />);
        expect(getByText('Brak znajomych')).toBeTruthy();
    });

    it('renders accepted friends and Add button when owner', () => {
        const onAdd = jest.fn();
        const { getByText, getAllByText } = render(
            <MemberList isOwner={true} members={[]} onAddFriend={onAdd} />
        );

        expect(getByText('a@example.com')).toBeTruthy();
        expect(getByText('c@example.com')).toBeTruthy();

        const addButtons = getAllByText('Dodaj');
        expect(addButtons).toHaveLength(2);

        fireEvent.press(addButtons[0]);
        expect(onAdd).toHaveBeenCalledWith('a@example.com');
    });

    it('does not render Add button when not owner', () => {
        const onAdd = jest.fn();
        const { queryByText } = render(
            <MemberList isOwner={false} members={[]} onAddFriend={onAdd} />
        );
        expect(queryByText('Dodaj')).toBeNull();
    });

    it('renders "Brak współtwórców" when members list is empty', () => {
        const { getByText } = render(<MemberList isOwner={true} members={[]} />);
        expect(getByText('Brak współtwórców')).toBeTruthy();
    });

    it('renders members and Remove button when owner', () => {
        const members: Member[] = [
            { id: 'm1', email: 'x@example.com' },
            { id: 'm2', email: 'y@example.com' },
        ];
        const onRemove = jest.fn();
        const { getByText, getAllByText } = render(
            <MemberList isOwner={true} members={members} onRemoveFriend={onRemove} />
        );

        expect(getByText('x@example.com')).toBeTruthy();
        expect(getByText('y@example.com')).toBeTruthy();

        const removeButtons = getAllByText('Usuń');
        expect(removeButtons).toHaveLength(2);

        fireEvent.press(removeButtons[1]);
        expect(onRemove).toHaveBeenCalledWith('y@example.com');
    });

    it('does not render Remove button when not owner', () => {
        const members: Member[] = [{ id: 'm1', email: 'x@example.com' }];
        const onRemove = jest.fn();
        const { queryByText } = render(
            <MemberList isOwner={false} members={members} onRemoveFriend={onRemove} />
        );
        expect(queryByText('Usuń')).toBeNull();
    });
});
