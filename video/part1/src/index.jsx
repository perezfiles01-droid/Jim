import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Part1, TOTAL } from './Part1';
registerRoot(() => <Composition id="Part1" component={Part1} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />);
