import { useMemo } from 'react';

import classNames from 'classnames';

import { HotKeys } from 'react-hotkeys';

import { replyComposeById, mentionComposeById } from 'mastodon/actions/compose';
import type { IconProp } from 'mastodon/components/icon';
import { Icon } from 'mastodon/components/icon';
import { useAppHistory } from 'mastodon/components/router';
import Status from 'mastodon/containers/status_container';
import { useAppSelector, useAppDispatch } from 'mastodon/store';

import { NamesList } from './names_list';
import type { LabelRenderer } from './notification_group_with_status';

export const NotificationWithStatus: React.FC<{
  type: string;
  icon: IconProp;
  iconId: string;
  accountIds: string[];
  statusId: string;
  count: number;
  labelRenderer: LabelRenderer;
  unread: boolean;
}> = ({
  icon,
  iconId,
  accountIds,
  statusId,
  count,
  labelRenderer,
  type,
  unread,
}) => {
  const history = useAppHistory();
  const dispatch = useAppDispatch();

  const label = useMemo(
    () =>
      labelRenderer({
        name: <NamesList accountIds={accountIds} total={count} />,
      }),
    [labelRenderer, accountIds, count],
  );

  const isPrivateMention = useAppSelector(
    (state) => state.statuses.getIn([statusId, 'visibility']) === 'direct',
  );

  const accountId = useAppSelector(
    (state) =>
      state.statuses.getIn([statusId, 'account']) as string | undefined,
  );
  const acct = useAppSelector(
    (state) => state.accounts.getIn([accountId, 'acct']) as string | undefined,
  );

  const handlers = useMemo(
    () => ({
      open: () => {
        if (acct) history.push(`/@${acct}/${statusId}`);
      },

      reply: () => {
        dispatch(replyComposeById(statusId, history));
      },

      mention: () => {
        dispatch(mentionComposeById(accountId, history));
      },

      // TODO: boost, favourite, toggleHidden
    }),
    [dispatch, history, statusId, accountId, acct],
  );

  return (
    <HotKeys handlers={handlers}>
      <div
        role='button'
        className={classNames(
          `notification-ungrouped focusable notification-ungrouped--${type}`,
          {
            'notification-ungrouped--unread': unread,
            'notification-ungrouped--direct': isPrivateMention,
          },
        )}
        tabIndex={0}
      >
        <div className='notification-ungrouped__header'>
          <div className='notification-ungrouped__header__icon'>
            <Icon icon={icon} id={iconId} />
          </div>
          {label}
        </div>

        <Status
          // @ts-expect-error -- <Status> is not yet typed
          id={statusId}
          contextType='notifications'
          withDismiss
          skipPrepend
          avatarSize={40}
          unfocusable
        />
      </div>
    </HotKeys>
  );
};
