import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Part3, TOTAL } from './Part3';
registerRoot(() => <Composition id="Part3" component={Part3} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />);
