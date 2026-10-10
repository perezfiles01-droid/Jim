import { Composition } from 'remotion';
import { Walkthrough, TOTAL } from './Walkthrough';
export const Root = () => (
  <Composition id="Walkthrough" component={Walkthrough}
    durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
);
