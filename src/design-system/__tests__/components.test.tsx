import { render, screen } from '@testing-library/react-native';

import { Card, ListGroup } from '../card';
import { ListRow } from '../list-row';
import { Metric } from '../metric';
import { Pill } from '../pill';
import { EmptyState } from '../state-views';
import { Text } from '../text';

describe('design system', () => {
  it('renders a card in both variants', async () => {
    await render(
      <>
        <Card>
          <Text>Surface</Text>
        </Card>
        <Card variant="ink" padded={false}>
          <Text tone="onInk">Ink</Text>
        </Card>
      </>,
    );
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('separates list group rows with hairlines', async () => {
    await render(
      <ListGroup inset={40}>
        <ListRow label="Connection" value="Online" />
        <ListRow label="Sync now" tone="primary" onPress={() => {}} />
      </ListGroup>,
    );
    expect(screen.getByLabelText('Connection, Online')).toBeTruthy();
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('speaks a metric as one phrase', async () => {
    await render(<Metric label="Safe to spend today" value="$42.18" unit="a day for 14 days" />);
    expect(screen.getByLabelText('Safe to spend today, $42.18, a day for 14 days')).toBeTruthy();
  });

  it('renders a pill on the ink card', async () => {
    await render(<Pill label="On track" tone="success" onInk />);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('shows an empty state action only with a handler', async () => {
    await render(<EmptyState title="No expenses" actionLabel="Add expense" />);
    expect(screen.queryByLabelText('Add expense')).toBeNull();
    await screen.rerender(
      <EmptyState title="No expenses" actionLabel="Add expense" onAction={() => {}} />,
    );
    expect(screen.getByLabelText('Add expense')).toBeTruthy();
  });
});
