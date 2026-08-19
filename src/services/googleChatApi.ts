export interface GoogleChatSpace {
  name: string; // e.g. "spaces/AAAA..."
  displayName?: string;
  spaceType?: 'SPACE' | 'GROUP_CHAT' | 'DIRECT_MESSAGE' | string;
  type?: 'ROOM' | 'DM' | string;
  spaceThreadingState?: 'THREADED_MESSAGES' | 'GROUPED_MESSAGES' | 'UNTHREADED_MESSAGES' | string;
  spaceUri?: string;
  description?: string;
}

export interface GoogleChatMessage {
  name: string; // e.g. "spaces/AAAA.../messages/BBBB..."
  sender?: {
    name?: string;
    displayName?: string;
    avatarUrl?: string;
    type?: 'HUMAN' | 'BOT' | string;
  };
  text?: string;
  formattedText?: string;
  createTime?: string;
  thread?: {
    name?: string;
    threadKey?: string;
  };
}

export interface GoogleChatMembership {
  name: string;
  state?: string;
  role?: 'ROLE_MEMBER' | 'ROLE_MANAGER' | 'ROLE_ASSIGNEE' | string;
  member?: {
    name?: string;
    displayName?: string;
    type?: 'HUMAN' | 'BOT' | string;
  };
}

const CHAT_BASE_URL = 'https://chat.googleapis.com/v1';

export async function listSpaces(accessToken: string): Promise<GoogleChatSpace[]> {
  const response = await fetch(`${CHAT_BASE_URL}/spaces`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to fetch Google Chat spaces (${response.status})`
    );
  }

  const data = await response.json();
  return data.spaces || [];
}

export async function createSpace(
  accessToken: string,
  displayName: string,
  spaceType: 'SPACE' | 'GROUP_CHAT' = 'SPACE'
): Promise<GoogleChatSpace> {
  const response = await fetch(`${CHAT_BASE_URL}/spaces`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      displayName,
      spaceType,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to create Google Chat space (${response.status})`
    );
  }

  return response.json();
}

export async function listMessages(
  accessToken: string,
  spaceName: string,
  pageSize = 40
): Promise<GoogleChatMessage[]> {
  const cleanSpaceName = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
  const response = await fetch(
    `${CHAT_BASE_URL}/${cleanSpaceName}/messages?pageSize=${pageSize}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to list messages in ${spaceName} (${response.status})`
    );
  }

  const data = await response.json();
  return data.messages || [];
}

export async function sendMessage(
  accessToken: string,
  spaceName: string,
  text: string,
  threadKey?: string
): Promise<GoogleChatMessage> {
  const cleanSpaceName = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
  const bodyPayload: any = { text };
  if (threadKey) {
    bodyPayload.thread = { threadKey };
  }

  const response = await fetch(`${CHAT_BASE_URL}/${cleanSpaceName}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to send message to ${spaceName} (${response.status})`
    );
  }

  return response.json();
}

export async function deleteMessage(
  accessToken: string,
  messageName: string
): Promise<void> {
  const response = await fetch(`${CHAT_BASE_URL}/${messageName}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to delete message (${response.status})`
    );
  }
}

export async function listMembers(
  accessToken: string,
  spaceName: string
): Promise<GoogleChatMembership[]> {
  const cleanSpaceName = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
  const response = await fetch(`${CHAT_BASE_URL}/${cleanSpaceName}/members`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to list members in ${spaceName} (${response.status})`
    );
  }

  const data = await response.json();
  return data.memberships || [];
}
