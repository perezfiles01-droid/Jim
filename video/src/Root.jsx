import { Composition } from 'remotion';
import { Walkthrough, TOTAL } from './Walkthrough';
import { Paper, PAGES, PW, PH } from './Paper';
export const Root = () => (
  <>
    <Composition id="Walkthrough" component={Walkthrough}
      durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
    <Composition id="Paper" component={Paper}
      durationInFrames={PAGES} fps={1} width={PW} height={PH} />
  </>
);
