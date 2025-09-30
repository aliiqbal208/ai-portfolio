'use client';

const Sports = () => {
  const sports = [
    { name: 'Cricket', emoji: '🏏', level: 'Advanced' },
    { name: 'Gym', emoji: '💪', level: 'Hard' },
    { name: 'Snooker', emoji: '🎱', level: 'Intermediate' },
    { name: 'Tekken', emoji: '🥋', level: 'Casual' }
  ];

  return (
    <div className="mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-foreground text-3xl font-semibold md:text-4xl">
          Sports & Activities
        </h2>
        <p className="mt-4 text-muted-foreground">
          Here are the sports and activities I enjoy and participate in regularly.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sports.map((sport, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="text-3xl">{sport.emoji}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{sport.name}</h3>
              <p className="text-sm text-muted-foreground">{sport.level}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sports;