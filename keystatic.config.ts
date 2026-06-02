import { collection, config, fields, singleton } from '@keystatic/core';

export default config({
	storage: {
		kind: 'local',
	},
	ui: {
		brand: {
			name: 'Class EDThings',
		},
	},
	collections: {
		announcements: collection({
			label: 'Announcements',
			columns: ['publishedOn', 'featured'],
			slugField: 'title',
			path: 'src/content/announcements/*/',
			format: {
				contentField: 'body',
			},
			schema: {
				title: fields.slug({
					name: { label: 'Announcement title' },
				}),
				publishedOn: fields.date({
					label: 'Publish date',
				}),
				summary: fields.text({
					label: 'Summary',
					multiline: true,
				}),
				featured: fields.checkbox({
					label: 'Feature on home page',
				}),
				body: fields.markdoc({
					label: 'Details',
				}),
			},
		}),
		weeklyLearning: collection({
			label: 'Homework / Weekly Learning',
			columns: ['weekOf'],
			slugField: 'title',
			path: 'src/content/weekly-learning/*/',
			format: {
				contentField: 'body',
			},
			schema: {
				title: fields.slug({
					name: { label: 'Week title' },
				}),
				weekOf: fields.date({
					label: 'Week of',
				}),
				summary: fields.text({
					label: 'Summary',
					multiline: true,
				}),
				body: fields.markdoc({
					label: 'Weekly learning details',
				}),
			},
		}),
		resources: collection({
			label: 'Resource Links',
			columns: ['category'],
			slugField: 'title',
			path: 'src/content/resources/*/',
			schema: {
				title: fields.slug({
					name: { label: 'Resource title' },
				}),
				category: fields.select({
					label: 'Category',
					options: [
						{ label: 'Reading', value: 'reading' },
						{ label: 'Math', value: 'math' },
						{ label: 'Writing', value: 'writing' },
						{ label: 'Family', value: 'family' },
						{ label: 'Classroom', value: 'classroom' },
					],
					defaultValue: 'family',
				}),
				description: fields.text({
					label: 'Description',
					multiline: true,
				}),
				href: fields.url({
					label: 'Link',
				}),
				audience: fields.select({
					label: 'Audience',
					options: [
						{ label: 'Families', value: 'families' },
						{ label: 'Students', value: 'students' },
						{ label: 'Both', value: 'both' },
					],
					defaultValue: 'families',
				}),
			},
		}),
	},
	singletons: {
		siteSettings: singleton({
			label: 'Site Settings',
			path: 'src/content/site-settings/',
			schema: {
				classroomName: fields.text({
					label: 'Classroom name',
				}),
				teacherName: fields.text({
					label: 'Teacher name',
				}),
				welcomeMessage: fields.text({
					label: 'Welcome message',
					multiline: true,
				}),
				contactNote: fields.text({
					label: 'Contact note',
					multiline: true,
				}),
			},
		}),
	},
});
