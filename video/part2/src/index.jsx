import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Part2, TOTAL } from './Part2';
registerRoot(() => <Composition id="Part2" component={Part2} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />);
