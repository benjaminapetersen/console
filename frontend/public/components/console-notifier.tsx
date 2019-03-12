import * as React from 'react';
import * as _ from 'lodash-es';

import { Firehose } from './utils';
import { referenceForModel } from '../module/k8s';
import { ConsoleNotificationModel } from '../models/index';

const ConsoleNotifier_: React.FC<ConsoleNotifierProps> = ({obj: {data}, location}) => {
  if (_.isEmpty(data)) {
    return null;
  }

  return <React.Fragment>
    {_.map(data, notification => (notification.spec.location === location || notification.spec.location === 'BannerTopBottom')
      ? <div key={notification.metadata.uid}
        className="co-global-notification"
        style={{
          backgroundColor: notification.spec.backgroundColor,
          color: notification.spec.color,
        }}>
        <div className="co-global-notification__content">
          <p className="co-global-notification__text">
            {notification.spec.text} {_.get(notification.spec, ['link', 'href'])
              && <a href={notification.spec.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="co-external-link"
                style={{color: notification.spec.color}}>{notification.spec.link.text || 'More info'}</a>}
          </p>
        </div>
      </div>
      : null)}
  </React.Fragment>;
};
ConsoleNotifier_.displayName = 'ConsoleNotifier_';

export const ConsoleNotifier: React.FC<{}> = props => {
  const consoleNotificationResources = [
    {
      kind: referenceForModel(ConsoleNotificationModel),
      isList: true,
      prop: 'obj',
    },
  ];
  return <Firehose resources={consoleNotificationResources}>
    <ConsoleNotifier_ {...props as ConsoleNotifierProps} />
  </Firehose>;
};
ConsoleNotifier.displayName = 'ConsoleNotifier';

type ConsoleNotifierProps = {
  obj: any;
  location: string;
};
