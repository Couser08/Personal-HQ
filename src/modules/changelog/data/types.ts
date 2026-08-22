import React from 'react';

export interface Feature {
  Icon: React.ElementType;
  title: string;
  desc: string;
  badge?: string;
}

export interface Release {
  version: string;
  codename: string;
  date: string;
  headline: string;
  sub: string;
  features: Feature[];
  type: 'major' | 'minor' | 'patch';
}
